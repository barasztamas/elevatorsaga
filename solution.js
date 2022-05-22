{
    init: (elevators, floors) => {
        elevators.forEach(e=>{
            e.directedQueue = [];
            e.direction = 0;
            e.showDirection = ()=>{
                e.goingUpIndicator(e.direction>=0);
                e.goingDownIndicator(e.direction<=0);
            };
            e.addToQueue = (nr, direction)=>{
                if(!e.destinationQueue.includes(nr)) e.goToFloor(nr);
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