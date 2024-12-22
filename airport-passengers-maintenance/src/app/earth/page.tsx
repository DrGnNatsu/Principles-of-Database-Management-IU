import React from 'react';
import Earth from './earth';
import ZoomChart from './zoom_chart';

export default function EarthPage (){
    return (
        <div className="flex flex-col items-center p-20 mt-8">
            <div>
                <Earth/>
            </div>
            <div className="w-full max-w-7xl bg-neutral-50 rounded-lg shadow-lg p-6 flex justify-center items-center">
                <ZoomChart/>
            </div>
        </div>
    );
}