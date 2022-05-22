{
    init: (elevators, floors) => {
        elevators.forEach(e=>{
            e.direction = ()=>{
                if(e.destinationQueue.length>0 && e.destinationQueue[0]<e.currentFloor()) return "down";
                if(e.destinationQueue.length>0 && e.destinationQueue[0]>e.currentFloor()) return "up";
                return "-"
            };
            e.showDirection = ()=>{
                e.goingUpIndicator(e.direction()!="down");
                e.goingDownIndicator(e.direction()!="up");
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

    },
        update: (dt, elevators, floors) => {
        }
}