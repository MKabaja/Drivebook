import { ArrowUpRight, Gauge, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { formatDailyRate, transmissionLabel, type PreviewCar } from '../../cars';
import { carCardStyles as s } from './car-card.styles';

type CarCardProps = { car: PreviewCar; onSelect: (car: PreviewCar) => void; index: number };

export function CarCard({ car, onSelect, index }: CarCardProps) {
  const reducedMotion = useReducedMotion();

  function handleSelect() {
    onSelect(car);
  }

  return (
    <motion.article
      className={s.card}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: reducedMotion ? 0 : 0.4, delay: index * 0.07 }}
    >
      <div className={s.imageLink}>
        <img
          className={s.image}
          src={car.image}
          alt={car.imageAlt}
          width="900"
          height="563"
          loading="lazy"
        />
        <span className={s.category}>{car.category}</span>
      </div>
      <div className={s.body}>
        <h3 className={s.title}>{car.name}</h3>
        <ul className={s.specs}>
          <li className={s.spec}>
            <Gauge size={16} aria-hidden="true" />
            {transmissionLabel[car.transmission]}
          </li>
          <li className={s.spec}>
            <Users size={16} aria-hidden="true" />
            {car.seats} miejsca
          </li>
        </ul>
        <div className={s.bottom}>
          <p className={s.price}>
            {formatDailyRate(car.dailyRateInGrosze)}
            <span className={s.unit}>/ doba</span>
          </p>
          <button
            type="button"
            className={s.button}
            onClick={handleSelect}
            aria-label={`Poznaj ${car.name}`}
          >
            Poznaj auto
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
