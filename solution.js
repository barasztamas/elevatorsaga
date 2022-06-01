{
    init: (elevators, floors) => {
        directionBetween = (from, to) => Math.sign(to-from);
        lastElement = a => a[a.length-1];
        elevators.forEach((e, i)=>{
            e.index = i;
            e.directionGoing = () => directionBetween(e.currentFloor(), e.destinationQueue[0]??e.currentFloor());
            e.directionShown = () => 1 * e.goingUpIndicator() - 1 * e.goingDownIndicator();
            e.showDirection = (direction=e.directionGoing()) => {
                e.goingUpIndicator(direction>=0);
                e.goingDownIndicator(direction<=0);
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