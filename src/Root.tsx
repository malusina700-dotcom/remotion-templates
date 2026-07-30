import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";

import example from "../examples/proof-walkthrough.video.json";
import { TemplateVideo } from "./Video";
import {
  dimensions,
  durationInFrames,
  VideoSpec,
  VideoSpecSchema,
} from "./schema";

const defaultSpec = VideoSpecSchema.parse(example);
const calculateMetadata: CalculateMetadataFunction<{ spec: VideoSpec }> = ({
  props,
}) => {
  const spec = VideoSpecSchema.parse(props.spec);
  return {
    ...dimensions(spec.target.aspect),
    fps: spec.target.fps,
    durationInFrames: durationInFrames(spec),
  };
};

export function RemotionRoot() {
  return (
    <>
      {(["Vertical", "Portrait", "Square"] as const).map((suffix) => {
        const aspect =
          suffix === "Vertical"
            ? "9:16"
            : suffix === "Portrait"
              ? "4:5"
              : "1:1";
        const size = dimensions(aspect);
        return (
          <Composition
            key={suffix}
            id={`InstavarTemplate${suffix}`}
            component={TemplateVideo}
            width={size.width}
            height={size.height}
            fps={30}
            durationInFrames={durationInFrames(defaultSpec)}
            defaultProps={{ spec: defaultSpec }}
            calculateMetadata={calculateMetadata}
          />
        );
      })}
    </>
  );
}
