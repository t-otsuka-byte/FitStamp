import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 320,
          background: '#f97316',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%', // Standard rounded square for apps
        }}
      >
        {/* Simple Dumbbell shape using unicode/css since we can't easily import lucide here without config */}
        💪
      </div>
    ),
    {
      ...size,
    }
  );
}
