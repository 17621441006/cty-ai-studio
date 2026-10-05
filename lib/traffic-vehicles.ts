export const trafficVehicles = [
  {id:'sports',src:'/assets/scenery/sports-car.webp',width:112,height:30,speed:194,frontWheel:.766,rearWheel:.183},
  {id:'bus',src:'/assets/scenery/double-decker-bus.webp',width:148,height:64,speed:126,frontWheel:.728,rearWheel:.235},
  {id:'taxi',src:'/assets/scenery/taxi.webp',width:104,height:34,speed:165,frontWheel:.783,rearWheel:.229},
] as const;

/** Allow the full body of a long, slower bus to pass beneath both paws. */
export function trafficHop(vehicle:{width:number;height:number;speed:number}) {
  return {
    duration:Math.max(1750,((vehicle.width+86)/vehicle.speed+.85)*1000),
    height:Math.max(112,vehicle.height*1.6+64),
  };
}

export const harborVehicles = [
 {id:'roadster-red',src:'/assets/scenery/convertible-red.webp',width:120,height:32.25,speed:177,frontWheel:.762,rearWheel:.178},
 {id:'roadster-teal',src:'/assets/scenery/convertible-teal.webp',width:120,height:32.25,speed:163,frontWheel:.762,rearWheel:.178},
] as const;
