import { createEducationProjector } from '@red-cup-engineering/education-platform-service/projector';
import { iyappyCourse } from '@red-cup-engineering/education-platform-service/themes/iyappy';

const sourceUrl = 'https://wotakuye.weebly.com/uploads/2/3/7/4/23749479/ldl121_packet.pdf';

export default {
  configVersion: 1,
  home: false,
  archives: false,
  search: false,
  site: {
    name: 'iYappy',
    baseIri: 'https://iyappy.561.group/',
    language: 'en',
    menu: [{ label: 'Practice', href: '/' }],
    license: 'All rights reserved',
  },
  projectors: [createEducationProjector({
    course: iyappyCourse,
    brand: {
      title: 'iYappy',
      subtitle: 'Lakota first. A little practice, a living language.',
      documentTitle: 'iYappy — Lakȟótiyapi / Lakota',
      language: 'en',
      tufteTheme: 'early-mac',
      orientationTitle: 'Lakȟótiyapi / Lakota',
      orientationHtml: '<p>Practice six Lakota forms of <em lang="lkt">yuhá</em> (have) and <em lang="lkt">čhíŋ</em> (want).</p><p>Choose a room and begin.</p>',
      courseTitle: 'Practice',
      sourceTitle: 'Lesson source',
      sourceHtml: `<p>These lessons use <a href="${sourceUrl}">LDL 121: Intensive Lakota/Dakota for Beginners</a>.</p><p>Lessons link to the source charts.</p>`,
    },
  })],
};
