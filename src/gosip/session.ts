/** Per-page-load flag so the cinematic splash plays once per visit. */
let introShown = false;
export const intro = {
  get shown() {
    return introShown;
  },
  markShown() {
    introShown = true;
  },
};
