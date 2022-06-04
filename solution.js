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
            e.fitsInQueue = (nr, direction, isStopped)=> {
                dirShown = e.directionShown();
                return e.destinationQueue.length == 0 && dirShown==0
                    || e.destinationQueue.length == 0 && (direction??dirShown) == dirShown && directionBetween(e.currentFloor(), nr) == dirShown
                    || (direction==undefined||direction==e.directionGoing()) && isBetween(nr, e.currentFloor()+(!isStopped ? e.directionGoing() : 0), e.destinationQueue[0]);
            };
            e.addToQueue = nr => {
                //console.trace('start',e.index, nr, e.destinationQueue);
                if(myAddToQueue(nr, e.directionGoing(), e.destinationQueue)){
                    //console.trace('end',e.index, nr, e.destinationQueue);
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
                //console.table({elevator:e.imdex, floor:nr, direction:e.directionShown(), q:e.destinationQueue, pressed:e.getPressedFloors()});
                arrivedWithQueue = () => {

                };
                arrivedWithEmptyQueue = () => {
                    floorsToAdd = e.getPressedFloors().filter(f=>e.fitsInQueue(f,undefined,true));
                    if (floorsToAdd.length>0) {
                        sortArray(floorsToAdd, e.directionShown());
                        e.addToQueue(floorsToAdd[0]);
                        arrivedWithQueue();
                    } else {
                        floorsToAdd = sortArray(e.getPressedFloors(), -e.directionShown());
                        if (floorsToAdd.length>0) {
                            e.addToQueue(floorsToAdd[0]);
                            arrivedWithQueue();
                        } else {
                            //TODO várnak-e liftre;
                        }
                        ;
                    };
                };
                if(e.destinationQueue.length==0) {
                    arrivedWithEmptyQueue();
                } else {
                    arrivedWithQueue();
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
            f.buttonPressed = (direction) => {
                addToRandomElevator(elevators.filter(e=>e.fitsInQueue(f.floorNum(), direction)), f.floorNum());
            };
            f.on("up_button_pressed", f.buttonPressed(1));
            f.on("down_button_pressed", f.buttonPressed(-1));
        });

    },
        update: (dt, elevators, floors) => {
        }
}