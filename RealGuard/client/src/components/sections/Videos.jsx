import { useState } from 'react';
import { getVideos } from '../../services/api.js';
import { useApiData } from '../../hooks/useApiData.js';

// A lista de vídeos vem do backend (server/src/data/videos.json).
export default function Videos() {
  const { data: videos, error } = useApiData(getVideos);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const list = videos || [];
  const v = list[index];
  const choose = (i) => {
    setIndex(i);
    setFailed(false);
  };

  const showEmpty = v && !v.youtube && (!v.src || failed);

  return (
    <section id="video" className="sec">
      <div className="wrap sec-one">
        <span className="kick">Vídeos</span>
        <div>
          <h2 className="h2">Veja funcionando</h2>
          <div className="vtabs" role="tablist" aria-label="Escolher vídeo">
            {list.map((item, i) => (
              <button
                type="button"
                role="tab"
                className="vtab"
                key={item.title}
                aria-selected={i === index}
                onClick={() => choose(i)}
              >
                {item.tab || item.title}
              </button>
            ))}
          </div>
          <div className="player">
            <div className="player-box">
              {v && !v.youtube && v.src && !failed && (
                <video key={v.src} src={v.src} controls playsInline preload="metadata" onError={() => setFailed(true)} />
              )}
              {v?.youtube && (
                <iframe
                  key={v.youtube}
                  src={`https://www.youtube.com/embed/${v.youtube}`}
                  title="Vídeo RealGuard"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {(showEmpty || error || !v) && (
                <div className="player-empty">
                  <b>{v?.title || 'Vídeo em breve'}</b>
                  <span>{error ? 'SEM SINAL · SERVIDOR INDISPONÍVEL' : 'SEM SINAL · VÍDEO EM BREVE'}</span>
                </div>
              )}
            </div>
            <p className="player-cap">{v?.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
