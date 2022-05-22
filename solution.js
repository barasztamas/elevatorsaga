{
    init: (elevators, floors) => {
        elevators.forEach(e=>{
            e.direction = ()=>{
                if(e.destinationQueue.length>0 && e.destinationQueue[0]<e.currentFloor()) return -1;
                if(e.destinationQueue.length>0 && e.destinationQueue[0]>e.currentFloor()) return 1;
                return 0;
            };
            e.showDirection = ()=>{
                e.goingUpIndicator(e.direction()>=0);
                e.goingDownIndicator(e.direction()<=0);
            };
            e.addToQueue = nr=>{
                e.goToFloor(nr);
                e.showDirection();
            };
            e.on("floor_button_pressed",nr=>{
                e.addToQueue(nr);
            });
            e.on("idle",()=>{
                e.addToQueue(0);
            });
            e.on("stopped_at_floor",nr=>{
                e.showDirection();
            });
        });
        floors.forEach(f=>{
            f.buttonPressed = ()=>{
                elevators[Math.floor(Math.random() * elevators.length)].addToQueue(f.floorNum());
            };
            f.on("up_button_pressed", f.buttonPressed);
            f.on("down_button_pressed", f.buttonPressed);
        });

    },
        update: (dt, elevators, floors) => {
        }
}