import React, { useState } from 'react';
import { Trip } from '../../types';
import Button from '../common/Button';

interface RatingFormProps {
    trip: Trip;
    onSubmitRating: (rating: number) => void;
    isLoading: boolean;
}

const StarIcon: React.FC<{ filled: boolean, onClick: () => void, onMouseEnter: () => void, onMouseLeave: () => void }> = 
({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-10 w-10 cursor-pointer transition-colors duration-200 ${filled ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const RatingForm: React.FC<RatingFormProps> = ({ trip, onSubmitRating, isLoading }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmitRating(rating);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-slate-800">Rate Your Trip</h2>
            <p className="text-slate-600 mt-2 mb-6">How was your trip with {trip.driverName}?</p>
            
            <div className="flex space-x-2 my-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                        key={star}
                        filled={(hoverRating || rating) >= star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    />
                ))}
            </div>

            <div className="mt-8 w-full">
                <Button 
                    onClick={handleSubmit} 
                    isLoading={isLoading} 
                    disabled={rating === 0 || isLoading}
                >
                    Submit Rating
                </Button>
            </div>
        </div>
    );
};

export default RatingForm;