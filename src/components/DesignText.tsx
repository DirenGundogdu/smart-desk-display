import { ReactNode } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

import { useScale } from '../theme';

type Props = {
  // Design coordinates (851×393): x like SVG's text x, y is the baseline.
  x: number;
  y: number;
  size: number;
  color: string;
  font: TextStyle;
  spacing?: number;
  // Box width for 'middle'/'end' anchors, as SVG text-anchor.
  anchor?: 'start' | 'middle' | 'end';
  width?: number;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
};

// Places text the way the art-direction SVG does, so layouts can be copied over by coordinates.
export function DesignText({ x, y, size, color, font, spacing = 0, anchor = 'start', width = 120, style, children }: Props) {
  const k = useScale();
  const left = anchor === 'start' ? x : anchor === 'middle' ? x - width / 2 : x - width;
  return (
    <Text
      numberOfLines={1}
      style={[
        {
          position: 'absolute',
          left: left * k,
          top: (y - size * 1.07) * k,
          fontSize: size * k,
          lineHeight: size * 1.2 * k,
          letterSpacing: spacing * k,
          color,
          includeFontPadding: false,
          textAlign: anchor === 'start' ? 'left' : anchor === 'middle' ? 'center' : 'right',
          ...(anchor === 'start' ? {} : { width: width * k }),
        },
        font,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
