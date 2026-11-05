# Axolotl Pro

A local static draft of a playful clubhouse for dragons, animals, LEGO builds, Pokémon card favorites, and a dinosaur versus knights game.

## Preview locally

From this folder, run `python3 -m http.server 8000 --directory dist` and open `http://localhost:8000`.

The site uses plain HTML, CSS, and JavaScript. `wrangler.jsonc` points Cloudflare Workers Static Assets at `dist/` for a later deployment. The Dragon Maker and Dino vs. Knights Arena run entirely in the browser. Neither saves or sends choices or scores. Titan Signal is available in the Game Corner and saves its progress in the browser on this site.

In the arena, choose Mechagodzilla, the knight, or one of three dinosaurs: Tyrannosaurus, Ankylosaurus, or Baryonyx. Attack beats Special, Block beats Attack, and Special beats Block. The opponent's next move is shown before each turn. Both fighters start with six health points. A successful move removes one point; the first fighter to bring the other's health bar to zero wins.

The arena uses a realistic jungle background and original semi-realistic character PNG artwork on transparent backgrounds. Tyrannosaurus bites and roars on Attack, then scrapes a foot backward before charging on Special. Ankylosaurus bashes and swings its tail club; Baryonyx swipes and lunges. Mechagodzilla attacks with its claws, braces its armor, and fires an energy beam. The knight swings his sword on Attack, raises his shield on Block, and thrusts his sword forward on Special. Fighters stand still while waiting and keep visible scuff marks as they lose health. The sound button can mute dinosaur roars; motion is reduced automatically when the visitor has reduced motion enabled.

## Animal Lab

Ten animal cards include a basic fact, an interesting fact, and a link to an animal or science source. Add future entries to the `animalCards` array in `dist/script.js`. Arena characters can be added to the `fighters` registry in the same file, along with matching artwork.

## Repository layout

The Axolotl Pro repository tracks the website in `dist/`, including the integrated Titan Signal game in `dist/titan-signal/`. The top-level `titan-signal/` folder is a separate local Git repository and is excluded from this repository. Edit the `dist/titan-signal/` copy when making changes that should be committed with Axolotl Pro.

## Next content pass

The Build Gallery and Card Corner contain labeled sample or placeholder content. Replace it with approved drawings, build photos, card photos, and short descriptions. Avoid adding a child's full name, school, location, or contact details to a public version. Decide whether the eventual site should be public or access restricted before publishing personal photos.
