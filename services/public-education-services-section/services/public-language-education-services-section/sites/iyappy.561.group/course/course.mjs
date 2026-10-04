/** Browser/build metadata for the finite Lakȟótiyapi course. */
import { buildIyappyWorld } from './build-world.mts';

export const iyappyCourse = Object.freeze({
  id: 'iyappy',
  buildWorld: buildIyappyWorld,
  adapter: Object.freeze({ source: new URL('./browser-adapter.mts', import.meta.url), exportName: 'iyappyTheme' }),
});
