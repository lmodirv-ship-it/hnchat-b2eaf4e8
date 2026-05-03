import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { PersistentBackground } from "./components/PersistentBackground";
import { Scene1Hero } from "./scenes/Scene1Hero";
import { Scene2AI } from "./scenes/Scene2AI";
import { Scene3Features } from "./scenes/Scene3Features";
import { Scene4Stats } from "./scenes/Scene4Stats";
import { Scene5CTA } from "./scenes/Scene5CTA";

// Total: 150 + 170 + 150 + 160 + 180 = 810 frames
// Transitions: 4 x 20 = 80 overlap
// Net: 810 - 80 = 730 frames (~24.3 sec at 30fps) — fits within 750 comp

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1Hero />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20, durationRestThreshold: 0.001 })}
        />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene2AI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20, durationRestThreshold: 0.001 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20, durationRestThreshold: 0.001 })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene4Stats />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20, durationRestThreshold: 0.001 })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
