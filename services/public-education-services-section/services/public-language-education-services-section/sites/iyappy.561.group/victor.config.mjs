import { createEducationProjector } from '@red-cup-engineering/education-platform-service/projector';
import { iyappyCourse } from './course/course.mjs';
import { FORMS, SOURCE } from './course/registry.mts';

const sourceHtml = `<p>These six singular forms follow the charts in <a href="${SOURCE.url}">${SOURCE.label}</a>, prepared by the Standing Rock Sioux Tribal Department of Education's Lakota/Dakota Language Revitalization Program.</p>
<p>See <a href="${SOURCE.url}#page=20">yuhá, PDF page 20</a> and <a href="${SOURCE.url}#page=46">čhíŋ, PDF page 46</a>. This practice covers these forms; it does not assess pronunciation or teach a general conjugation rule.</p>
<h3>Read and practice here</h3><p>You can use this section with JavaScript disabled, or save the page. Open the answers before printing. First recall the form for each person, then open its answer. Next cover the person labels and identify the person from each form.</p>
${FORMS.map(({ lemma, gloss, person, form }) => `<details><summary>${lemma} (${gloss}): ${person}</summary><p lang="lkt">${form}</p></details>`).join('\n')}`;

export default {
  configVersion: 1, home: false, archives: false, search: false, publicDir: './assets',
  site: { name: 'iYappy', baseIri: 'https://iyappy.561.group/', language: 'en',
    menu: [{ label: 'Practice', href: '/' }], license: 'All rights reserved' },
  projectors: [createEducationProjector({
    course: iyappyCourse,
    brand: {
      title: 'iYappy', subtitle: 'Lakota first. A little practice, a living language.',
      documentTitle: 'iYappy — Lakȟótiyapi / Lakota', language: 'en', tufteTheme: 'early-mac',
      orientationTitle: 'Lakȟótiyapi / Lakota',
      orientationHtml: '<p>Practice six Lakota forms of <em lang="lkt">yuhá</em> (have) and <em lang="lkt">čhíŋ</em> (want).</p><p>Choose a room and begin, or use the reading practice below.</p>',
      courseTitle: 'Practice', sourceTitle: 'Lesson source and reading practice', sourceHtml,
    },
  })],
};
