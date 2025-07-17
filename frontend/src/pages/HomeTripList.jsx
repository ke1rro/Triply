import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './HomeAnimations.css';
import TravelCard from '../components/TravelCard';
import TravelModalWithCopy from '../components/TravelModalWithCopy';

export default function HomeTripList({ trips, onLike }) {
  return (
    <TransitionGroup className="flex w-full flex-col items-center space-y-6">
      {trips.map((travel) => (
        <CSSTransition
          key={travel.id}
          timeout={500}
          classNames="trip-list-animate"
        >
          <div className="w-full max-w-md">
            <TravelCard trip={travel} ModalComponent={TravelModalWithCopy} onLike={onLike} />
          </div>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}
