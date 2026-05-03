import { loadFont } from "@remotion/google-fonts/Inter";
const { fontFamily: interFont } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
const { fontFamily: cairoFont } = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });

export { interFont, cairoFont };
