import { UIBlock } from '@/shared/ui/Block';
import type { JSX } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { IMainState, TMainDispatch } from '@/app/store';
import { setCurrent } from '@/app/store/slices/estimation';
import SvgDeg from '@/shared/assets/icons/deg.svg';
import styles from './Current.module.scss';

interface IInterTempUnit {
  depth: string;
  temp: string;
}

function Current(): JSX.Element {
  const currentState = useSelector((state: IMainState) => state.estimation);
  const dispatch = useDispatch<TMainDispatch>();

  
  const interTempUnit = currentState.current?.interTempUnit || [];
  const safeInterTempUnit = Array(3)
    .fill(null)
    .map((_, i) => interTempUnit[i] || { depth: '', temp: '' });

  const handleInterTempChange = (
    index: number,
    field: 'depth' | 'temp',
    value: string
  ) => {
    const newInterTempUnit = [...safeInterTempUnit];
    newInterTempUnit[index] = {
      ...newInterTempUnit[index],
      [field]: value,
    };
    dispatch(setCurrent({ interTempUnit: newInterTempUnit }));
  };

  const handleDangerSignChange = (id: string) => {
    const currentSigns = currentState.current?.signsDanger || [];
    const newSigns = currentSigns.includes(id)
      ? currentSigns.filter((sign) => sign !== id)
      : [...currentSigns, id];
    dispatch(setCurrent({ signsDanger: newSigns }));
  };

  const handleSurfTempChange = (value: string) => {
    const numValue = value === '' ? null : Number(value);
    dispatch(setCurrent({ surfTemp: isNaN(numValue as number) ? null : numValue }));
  };

  return (
    <section style={{ width: '100%' }}>
      <UIBlock type="red" iconSrc={SvgDeg} headTxt="Текущее состояние штабеля">
        <div className={styles['block-body']}>
          <div className={styles['block-body__ctx']}>

            <div className={styles['full-width']}>
              <h4>Внутренние температуры штабеля</h4>
              <div className={styles['table-wrapper']}>
                <div className={styles['table-header']}>
                  <div>Глубина (м)</div>
                  <div>Температура</div>
                </div>
                {safeInterTempUnit.map((row, index) => (
                  <div key={index} className={styles['table-row']}>
                    <input
                      type="text"
                      className={styles['table-input']}
                      value={row.depth}
                      onChange={(e) =>
                        handleInterTempChange(index, 'depth', e.target.value)
                      }
                      placeholder="0.0"
                    />
                    <input
                      type="text"
                      className={styles['table-input']}
                      value={row.temp}
                      onChange={(e) =>
                        handleInterTempChange(index, 'temp', e.target.value)
                      }
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
                value={currentState.current?.surfTemp ?? ''}
                onChange={(e) => handleSurfTempChange(e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className={styles['full-width']}>
              <h4>Признаки опасности(Опционально)</h4>
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
                      checked={currentState.current?.signsDanger?.includes(sign.id) || false}
                      onChange={() => handleDangerSignChange(sign.id)}
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
              <h4>Недавние действия(Опционально)</h4>

              <div className={styles['checkbox-item']}>
                <input
                  type="checkbox"
                  id="reformed"
                  checked={currentState.current?.isReformed || false}
                  onChange={(e) => dispatch(setCurrent({ isReformed: e.target.checked }))}
                  className={styles['checkbox']}
                />
                <label htmlFor="reformed" className={styles['checkbox-label']}>
                  Штабель недавно перевален / переформирован?
                </label>
              </div>

              <div className={styles['checkbox-item']}>
                <input
                  type="checkbox"
                  id="oroshen"
                  checked={currentState.current?.isOroshen || false}
                  onChange={(e) => dispatch(setCurrent({ isOroshen: e.target.checked }))}
                  className={styles['checkbox']}
                />
                <label htmlFor="oroshen" className={styles['checkbox-label']}>
                  Недавно проводилось орошение / охлаждение?
                </label>
              </div>
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Current;