import Ride from "../models/Ride.js"
import User from "../models/User.js"; 

export const getRide = async (req, res, next) => {
  try{
    const ride = await Ride.findById(req.params.id).populate('creator', 'name age stars rating profile ridesCreated createdAt').lean(); 
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(ride); 
  }catch(err){
    next(err);
  }
}

export const getAllRides = async (req, res, next) => {
  try{
    const rides = await Ride.find().populate('creator', 'name stars').lean(); 
    res.status(200).json(rides); 
  }catch(err){
    next(err);
  }
}

export const findRides = async (req, res, next) => {
  try {
    const { from, to, seat, date } = req.query;
    if (!from || !to || !seat) {
        return res.status(400).json({ message: 'Please provide all the details' });
    }
    const rides = await Ride.find({
        'origin.place': new RegExp(from, 'i'),
        'destination.place': new RegExp(to, 'i'),
        'availableSeats': { $gte: seat},
        // 'startTime': date 
    })
    .populate('creator', 'name stars') 
    .lean(); 
    res.status(200).json({ success: true, rides });
  } catch (err) {
    next(err);
  }
}

export const createRide = async (req, res, next) =>{
  try{
    const newRide = new Ride(req.body);
    await newRide.save()
    await User.findByIdAndUpdate(req.body.creator, { $push: { ridesCreated: newRide._id } });
    res.status(201).send(newRide)
  }catch(err){
    next(err);
  }
}

export const updateRide = async(req, res, next) => {
  try{
    const { ...details } = req.body;
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      {
        $set: details,
      },
      {new:true}    
    )
    res.status(200).json({success: true, ride})
  }catch(err){
    next(err)
  }
}

export const deleteRide = async(req, res, next) => {
  try{
    await Ride.findByIdAndDelete(req.params.id);
    User.findOneAndUpdate({ _id: req.body.creator },{ $pull: { ridesCreated: req.params.id } })
    res.status(200).send("ride has been deleted");
  }catch(err){
    next(err)
  }
}