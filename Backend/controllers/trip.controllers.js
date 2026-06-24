import TripExpenses from "../model/tripeExpenses.js";
import { validationResult } from "express-validator";
import { cloudinary } from "../utils/cloudinary.js";

const createTripExpense = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => ({ ...e, value: undefined })) });
    }

    if (!req.user || !req.user.id) {
        return res.status(401).json({message: "Authentication required"});
    }

    const userId = req.user.id;

    let {Vehicle_Number, route, tripDate, totalIncome, fuelCost, driverAllowance, hamaali, paidTransport, maintenanceCost, otherExpenses, commission, pendingAmount, paymentStatus, phonePai, commissionPaymentDate} = req.body;

    Vehicle_Number = Vehicle_Number?.trim().toString().toUpperCase();
    route = route?.trim().toString();
    tripDate = tripDate?.trim().toString();


    try {
        const tripExpense = await TripExpenses.create({
            userId,
            Vehicle_Number,
            route,
            tripDate,
            totalIncome,
            fuelCost: fuelCost || 0,
            driverAllowance: driverAllowance || { totalSalary: 7000, bonus: 0, paid: 0 },
            hamaali: hamaali || 0,
            paidTransport: paidTransport || 0,
            maintenanceCost: maintenanceCost || 0,
            otherExpenses: otherExpenses || 0,
            commission: commission || 0,
            pendingAmount: pendingAmount || 0,
            paymentStatus: paymentStatus || "Pending",
            phonePai: phonePai || 0,
            commissionPaymentDate: commissionPaymentDate || null
        });

        const netProfit = tripExpense.netProfit;

        return res.status(201).json({message:"Trip expense created successfully", tripExpense});
    } catch (error) {
        console.error("Create trip error:", error.message);
        return res.status(500).json({message:"Something went wrong. Please try again."});
    }
}

const getTripExpenses = async(req,res)=>{
    const {id}= req.params;

    try {
        const userId = req.user.id;
        const trip = await TripExpenses.findOne({ _id: id, userId }).lean({ virtuals: true });
        if(!trip){
            return res.status(404).json({message:"Trip expense not found"});
        }
        res.status(200).json({trip});
    } catch (error) {
        console.error("Get trip error:", error.message);
        return res.status(500).json({message:"Something went wrong. Please try again."});
    }
}

const getAllTripExpenses = async(req,res)=>{
    try {
        const userId = req.user.id;
        const trips = await TripExpenses.find({ userId }).sort({createdAt: -1});
        return res.status(200).json({trips, count: trips.length});
    } catch (error) {
        console.error("Get all trips error:", error.message);
        return res.status(500).json({message:"Something went wrong. Please try again."});
    }
}

const updateTrips = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => ({ ...e, value: undefined })) });
  }

  const { id } = req.params;

  const allowedFields = [
    "Vehicle_Number",
    "route",
    "tripDate",
    "totalIncome",
    "fuelCost",
    "hamaali",
    "paidTransport",
    "maintenanceCost",
    "otherExpenses",
    "commission",
    "pendingAmount",
    "paymentStatus",
    "phonePai",
    "commissionPaymentDate",
    "driverAllowance"
  ];

  const updates = {};

  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  
  if (updates.Vehicle_Number)
    updates.Vehicle_Number = updates.Vehicle_Number.trim().toUpperCase();

  if (updates.route)
    updates.route = updates.route.trim();

  if (updates.monthAndYear)
    updates.monthAndYear = updates.monthAndYear.trim();

 
  if (req.body.driverAllowance) {
    updates.driverAllowance = {
      totalSalary: req.body.driverAllowance.totalSalary ?? undefined,
      bonus: req.body.driverAllowance.bonus ?? undefined,
      paid: req.body.driverAllowance.paid ?? undefined
    };
  }

  try {
    const userId = req.user.id;
    const updatedTrip = await TripExpenses.findOneAndUpdate(
      { _id: id, userId }, 
      updates,
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip expense not found" });
    }

    return res.status(200).json({
      message: "Trip expense updated successfully",
      trip: updatedTrip
    });

  } catch (error) {
    console.error("Update trip error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const deleteTrip = async(req,res)=>{
    const {id}= req.params;

    try {
        const userId = req.user.id;
        const deletTrip = await TripExpenses.findOneAndDelete({ _id: id, userId });
        if(!deletTrip){
            return res.status(404).json({message:"Trip expense not found"});
        }
        return res.status(200).json({message:"Trip expense deleted successfully"});
    } catch (error) {
        console.error("Delete trip error:", error.message);
        return res.status(500).json({message:"Something went wrong. Please try again."});
    }
}

const uploadRecipt = async(req,res)=>{
    try {
      const {id} = req.params;
      if(!req.file){
        return res.status(400).json({message:"No file uploaded"});
      }

      const userId = req.user.id;
      const trip = await TripExpenses.findOne({ _id: id, userId });
      if(!trip){
         await cloudinary.uploader.destroy(req.file.filename);
        return res.status(404).json({message:"Trip expense not found"});
      }

      trip.receipts.push({
        url: req.file.path,
        public_id: req.file.filename,
        uploadedAt: new Date()
      })
      await trip.save();
      res.status(200).json({message:"Receipt uploaded successfully", receipt: trip.receipts[trip.receipts.length - 1]});
    } catch (error) {
      console.error("Upload trip receipt error:", error.message);
      return res.status(500).json({message:"Failed to upload receipt. Please try again."});
    }
}

const deleteRecipt = async(req,res)=>{
    try {
      const {id, receiptId} = req.params;

      const userId = req.user.id;
      const trip = await TripExpenses.findOne({ _id: id, userId });
      if(!trip){
        return res.status(404).json({message:"Trip expense not found"});
      }

      const receipt = trip.receipts.id(receiptId);
      if(!receipt){
        return res.status(404).json({message:"Receipt not found"});
      }

      await cloudinary.uploader.destroy(receipt.public_id);

      trip.receipts.pull(receiptId);
      await trip.save();

      res.status(200).json({message:"Receipt deleted successfully"});
    } catch (error) {
      console.error("Delete trip receipt error:", error.message);
      return res.status(500).json({message:"Failed to delete receipt. Please try again."});
    }
  }

 const getReceipts = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;
    const trip = await TripExpenses.findOne({ _id: id, userId }).select('receipts');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json({ receipts: trip.receipts });
  } catch (error) {
    console.error("Get receipts error:", error.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export{
    createTripExpense,
    getTripExpenses,
    getAllTripExpenses,
    updateTrips,
    deleteTrip,
    uploadRecipt,
    deleteRecipt,
    getReceipts
}
