import { UIBlock } from '@/shared/ui/Block';
import type { JSX } from 'react';
import { useState } from 'react';

import SvgDeg from '@/shared/assets/icons/deg.svg';
import styles from './Current.module.scss';


function Current(): JSX.Element {
    
  const [innerTemps, setInnerTemps] = useState([
    { depth: '', temp: '' },
    { depth: '', temp: '' },
    { depth: '', temp: '' },
  ]);

  const [surfaceTemp, setSurfaceTemp] = useState<string>('');
  const [dangerSigns, setDangerSigns] = useState<string[]>([]);
  const [reformatted, setReformatted] = useState<string>('');
  const [watered, setWatered] = useState<string>('');

  const handleInnerTempChange = (index: number, field: 'depth' | 'temp', value: string) => {
    const newTemps = [...innerTemps];
    newTemps[index][field] = value;
    setInnerTemps(newTemps);
  };

  const handleDangerChange = (id: string) => {
    setDangerSigns((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section style={{ width: '100%' }}>
      <UIBlock
        type="red"
        iconSrc={SvgDeg}
        headTxt="Текущее состояние штабеля"
      >
        <div className={styles['block-body']}>
          <div className={styles['block-body__ctx']}>
            <div className={styles['full-width']}>
              <h4>Внутренние температуры штабеля</h4>
              <div className={styles['table-wrapper']}>
                <div className={styles['table-header']}>
                  <div>Глубина (м)</div>
                  <div>Температура</div>
                </div>
                {innerTemps.map((row, index) => (
                  <div key={index} className={styles['table-row']}>
                    <input
                      type="text"
                      className={styles['table-input']}
                      value={row.depth}
                      onChange={(e) => handleInnerTempChange(index, 'depth', e.target.value)}
                      placeholder="0.0"
                    />
                    <input
                      type="text"
                      className={styles['table-input']}
                      value={row.temp}
                      onChange={(e) => handleInnerTempChange(index, 'temp', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles['full-width']}>
              <h4>Температура поверхности</h4>
              <input
                type="text"
                className={styles['select-params']}
                value={surfaceTemp}
                onChange={(e) => setSurfaceTemp(e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className={styles['full-width']}>
              <h4>Признаки опасности</h4>
              <div className={styles['checkbox-group']}>
                {[
                  { id: 'smell', label: 'Запах горения' },
                  { id: 'smoke', label: 'Видимый дым' },
                  { id: 'hotspots', label: 'Обнаружены горячие точки' },
                ].map((sign) => (
                  <div key={sign.id} className={styles['checkbox-item']}>
                    <input
                      type="checkbox"
                      id={`danger-${sign.id}`}
                      checked={dangerSigns.includes(sign.id)}
                      onChange={() => handleDangerChange(sign.id)}
                      className={styles['checkbox']}
                    />
                    <label htmlFor={`danger-${sign.id}`} className={styles['checkbox-label']}>
                      {sign.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles['full-width']}>
              <h4>Недавние действия</h4>
              
              <div>
                <h5>Штабель недавно перевален / переформирован?</h5>
                <div className={styles['radio-group']}>
                  {[
                    { id: 'yes', label: 'Да' },
                    { id: 'no', label: 'Нет' },
                  ].map((option) => (
                    <div key={option.id} className={styles['radio-item']}>
                      <input
                        type="radio"
                        id={`reformatted-${option.id}`}
                        name="reformatted"
                        value={option.id}
                        checked={reformatted === option.id}
                        onChange={(e) => setReformatted(e.target.value)}
                        className={styles['radio']}
                      />
                      <label htmlFor={`reformatted-${option.id}`} className={styles['radio-label']}>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5>Недавно проводилось орошение / охлаждение?</h5>
                <div className={styles['radio-group']}>
                  {[
                    { id: 'yes', label: 'Да' },
                    { id: 'no', label: 'Нет' },
                  ].map((option) => (
                    <div key={option.id} className={styles['radio-item']}>
                      <input
                        type="radio"
                        id={`watered-${option.id}`}
                        name="watered"
                        value={option.id}
                        checked={watered === option.id}
                        onChange={(e) => setWatered(e.target.value)}
                        className={styles['radio']}
                      />
                      <label htmlFor={`watered-${option.id}`} className={styles['radio-label']}>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Current;
