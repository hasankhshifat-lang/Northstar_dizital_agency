import React from 'react';
import {Still} from 'remotion';
import {Thumb, ThumbProps, defaultProps} from './Thumb';

// One Still; the render script passes width/height through the props (16:9 1280x720 or 9:16 1080x1920).
export const Root: React.FC = () => (
  <Still
    id="Thumb"
    component={Thumb}
    width={1280}
    height={720}
    defaultProps={defaultProps}
    calculateMetadata={({props}: {props: ThumbProps}) => ({width: props.width, height: props.height})}
  />
);
