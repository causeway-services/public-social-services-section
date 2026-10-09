// Reconcile accepted work first. New work gets one turn per channel before
// a channel's next turn, ordered by its earliest unfilled publication need.
// Provider compute prices are unknown; this orders work without inventing them.
export function orderProductionWork(work, {now = Date.now()} = {}) {
  const deadline = item => Number.isFinite(Date.parse(item.deadline)) ? Date.parse(item.deadline) : Infinity;
  const compare = (a, b) => deadline(a) - deadline(b)
    || String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''))
    || a.channel.localeCompare(b.channel);
  const accepted = work.filter(item => item.accepted).sort(compare);
  const compareTurn = (a, b) => {
    const aDue=deadline(a)<=now, bDue=deadline(b)<=now;
    // Overdue Shorts can otherwise keep the same channel first at every reset.
    // Actual retained submission times rotate those turns across worker runs.
    return Number(bDue)-Number(aDue)
      || (aDue&&bDue ? (Date.parse(a.lastNotebookSubmission)||0)-(Date.parse(b.lastNotebookSubmission)||0) : 0)
      || compare(a,b);
  };
  const channels = new Map();
  const pending=work.filter(item => !item.accepted);
  for (const item of pending.filter(item=>item.origin!=='google-flow').sort(compare)) {
    const queue = channels.get(item.channel) ?? [];
    queue.push(item); channels.set(item.channel, queue);
  }
  const ordered = [...accepted];
  while (channels.size) {
    const turn = [];
    for (const [channel, queue] of channels) {
      turn.push(queue.shift());
      if (!queue.length) channels.delete(channel);
    }
    ordered.push(...turn.sort(compareTurn));
  }
  // Flow has its own credit pool and proceeds even when Notebook admits nothing.
  return [...ordered,...pending.filter(item=>item.origin==='google-flow').sort(compare)];
}
