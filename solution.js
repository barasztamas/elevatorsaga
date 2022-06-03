{
    init: (elevators, floors) => {
        directionBetween = (from, to) => Math.sign(to-from);
        isBetween = (n, a, b, inclusive=true) => {
            return inclusive ? (n - a) * (n - b) <= 0 : (n - a) * (n - b) < 0;
        };
        lastElement = a => a[a.length-1];
        sortArray = (array, direction) => {
            array.sort((a,b) => direction*(a-b));
            return array;
        };
        myAddToQueue = (nr, direction, queue)=>{
            if(!queue.includes(nr)) {
                queue.push(nr);
                sortArray(queue, direction);
                return true;
            };
            return false;
        };
        elevators.forEach((e, i)=>{
            e.index = i;
            e.directionGoing = () => directionBetween(e.currentFloor(), e.destinationQueue[0]??e.currentFloor());
            e.directionShown = () => 1 * e.goingUpIndicator() - 1 * e.goingDownIndicator();
            e.showDirection = (direction=e.directionGoing()) => {
                e.goingUpIndicator(direction>=0);
                e.goingDownIndicator(direction<=0);
            };
            e.fitsInQueue = nr => {
                return e.destinationQueue.length == 0 && e.directionShown()==0
                    || e.destinationQueue.length == 0 && directionBetween(e.currentFloor(), nr) == e.directionShown()
                    || isBetween(nr, e.currentFloor()+e.directionGoing(), e.destinationQueue[0]);
            };
            e.addToQueue = nr => {
                if(myAddToQueue(nr, e.directionGoing(), e.destinationQueue)){
                    e.checkDestinationQueue();
                    e.showDirection();
                };
            };
            e.on("floor_button_pressed", nr=>{
                if(e.fitsInQueue(nr))
                    e.addToQueue(nr);
            });
            e.on("idle",()=>{
                e.addToQueue(0);
            });
            e.on("stopped_at_floor",nr=>{
                floorsToAdd = sortArray(e.getPressedFloors().filter(e.fitsInQueue), e.directionShown());
                if (floorsToAdd.length>0) {
                    e.addToQueue(floorsToAdd[0]);
                };
                e.showDirection();
            });
        });
        addToRandomElevator = (myElevators, nr) => {
            if (myElevators.length>0) {
                myElevators[Math.floor(Math.random() * myElevators.length)].addToQueue(nr);
                return true;
            }
            return false;
        };
        floors.forEach(f=>{
            f.buttonPressed = ()=>{
                addToRandomElevator(elevators.filter(e=>e.fitsInQueue(f.floorNum())), f.floorNum());
            };
            f.on("up_button_pressed", f.buttonPressed);
            f.on("down_button_pressed", f.buttonPressed);
        });

    },
        update: (dt, elevators, floors) => {
        }
}