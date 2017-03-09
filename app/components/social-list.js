import Ember from 'ember';

const {
  Component,
  computed,
  get,
  inject: { service },
  RSVP: { hash },
  setProperties,
} = Ember;

export default Component.extend({
  social: service(),
  lastfm: null,
  zombies: null,

  tracks: computed('lastfm', function() {
    let lastfm = get(this, 'lastfm');
    if(!lastfm) {
      return;
    }

    let { track } = lastfm;

    return track.map((t, i) => {
      let artist = get(t, 'artist.#text');
      let isLast = i + 1 === track.length;
      return {
        name: t.name,
        artist,
        isLast,
      };
    });
  }),

  latestRun: computed('zombies', function() {
    let zombies = get(this, 'zombies');
    if(!zombies) {
      return;
    }

    let { metrics, summary: { first_mission: missionCode }, id } = zombies;
    let time = Math.round((metrics.duration / 60) * 100) / 100;
    let distance = Math.round((metrics.distance / 1000) * 100) / 100;
    let link = `https://zombiesrungame.com/zombielink/runs-detailed/${id}/public/`;

    return { time, distance, missionCode, link };
  }),

  didInsertElement() {
    this._super(...arguments);

    let s = get(this, 'social');

    let hashOfPromises = hash({
      zombies: s.fetch('zombies'),
      lastfm: s.fetch('lastfm'),
    });

    return hashOfPromises
      .then(({ zombies, lastfm }) => {
        if(!lastfm || !lastfm.recenttracks) {
          lastfm = {};
        }

        let recentTracks = lastfm.recenttracks;

        setProperties(this, {
          zombies,
          lastfm: recentTracks,
        });
      });
  },
});
