// Camadas empilhadas em Z que dão espessura aos celulares 3D.
export default function PhoneLayers({ count = 10, step = 1.4 }) {
  const layers = [];
  for (let i = count; i >= 1; i--) {
    layers.push(
      <div
        key={i}
        className={'lay' + (i % 3 === 0 ? '' : ' edge')}
        style={{ transform: `translateZ(${(-i * step).toFixed(2)}px)` }}
      />
    );
  }
  return layers;
}
