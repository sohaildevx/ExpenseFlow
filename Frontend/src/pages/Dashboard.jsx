import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { LogOut, User, BarChart3, Truck, Settings } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { trips, tripStats, loading, fetchTrips } = useTrip();
  const { user, logOut } = useAuth();

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  const recentTrips = trips.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="border-8 border-black bg-yellow-400 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-2xl font-black uppercase tracking-tight animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight border-b-4 border-black inline-block pb-2 bg-yellow-400 px-4 transform -rotate-1">
            Dashboard
          </h1>
          <p className="mt-3 font-bold uppercase text-sm tracking-tight">
            {`Welcome back, ${user?.name || "Transport Owner"}`}
          </p>
        </div>

        <div className="flex items-center gap-7 w-full md:w-auto justify-end">
         
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 border-3 sm:border-4 border-black rounded-full flex items-center justify-center font-black text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                {user.name[0].toUpperCase()}
              </button>

             
              {showUserMenu && (
                <>
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white border-3 sm:border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
                    <div className="border-b-3 sm:border-b-4 border-black p-3 sm:p-4 bg-yellow-400">
                      <p className="font-black uppercase text-xs sm:text-sm">
                        Account
                      </p>
                      <p className="font-bold text-[10px] sm:text-xs mt-1 truncate">
                        {user.name}
                      </p>
                      <p className="font-bold text-[10px] sm:text-xs text-gray-700 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3 font-black uppercase text-xs sm:text-sm hover:bg-red-400 transition-colors text-left"
                    >
                      <LogOut
                        size={16}
                        className="sm:w-[18px] sm:h-[18px]"
                        strokeWidth={3}
                      />
                      Logout
                    </button>
                  </div>

                 
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                </>
              )}
                  
            </div>
          )}
          <button
            onClick={() => navigate("/add-trip")}
            className="bg-black text-yellow-400 font-black text-xs sm:text-sm md:text-lg uppercase py-2 px-3 sm:py-3 sm:px-4 md:px-6 border-3 sm:border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 sm:hover:translate-x-2 sm:hover:translate-y-2 transition-all select-none cursor-pointer"
          >
            <span className="hidden sm:inline">+ Add Trip</span>
            <span className="sm:hidden">+ Trip</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-wider mb-2">
            Total Trips
          </p>
          <p className="text-3xl font-black">{tripStats.totalTrips}</p>
        </div>

        <div className="bg-green-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-wider mb-2">
            Total Income
          </p>
          <p className="text-2xl font-black">
            ₹{tripStats.totalIncome.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-red-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-wider mb-2">
            Total Expenses
          </p>
          <p className="text-2xl font-black">
            ₹{tripStats.totalExpenses.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-yellow-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
          <p className="text-xs font-black uppercase tracking-wider mb-2">
            Net Profit
          </p>
          <p className="text-2xl font-black">
            ₹{tripStats.netProfit.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-orange-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-wider mb-2">
            Pending
          </p>
          <p className="text-2xl font-black">
            ₹{tripStats.pendingAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b-4 border-black pb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`font-black text-sm md:text-base uppercase py-2 px-4 border-4 border-black transition-all ${
            activeTab === "overview"
              ? "bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white hover:bg-yellow-400"
          }`}
        >
          Overview
        </button>
        <Link to="/all-trips"
          onClick={() => setActiveTab("trips")}
          className={`font-black text-sm md:text-base uppercase py-2 px-4 border-4 border-black transition-all ${
            activeTab === "trips"
              ? "bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white hover:bg-yellow-400"
          }`}
          >
          All Trips
        </Link>
        <button
          onClick={() => setActiveTab("reports")}
          className={`font-black text-sm md:text-base uppercase py-2 px-4 border-4 border-black transition-all ${
            activeTab === "reports"
              ? "bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white hover:bg-yellow-400"
          }`}
        >
          Reports
        </button>
      </div>

      <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-yellow-400 border-b-4 border-black p-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
            Recent Trips
          </h2>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-yellow-400">
              <tr>
                <th className="text-left p-4 font-black uppercase text-sm border-r-4 border-white">
                  Vehicle
                </th>
                <th className="text-left p-4 font-black uppercase text-sm border-r-4 border-white">
                  Route
                </th>
                <th className="text-left p-4 font-black uppercase text-sm border-r-4 border-white">
                  Date
                </th>
                <th className="text-left p-4 font-black uppercase text-sm border-r-4 border-white">
                  Income
                </th>
                <th className="text-left p-4 font-black uppercase text-sm border-r-4 border-white">
                  Status
                </th>
                <th className="text-left p-4 font-black uppercase text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip, index) => (
                <tr
                  key={trip._id}
                  className={`border-t-4 border-black ${
                    index % 2 === 0 ? "bg-stone-50" : "bg-white"
                  }`}
                >
                  <td className="p-4 font-bold">{trip.Vehicle_Number}</td>
                  <td className="p-4 font-bold">{trip.route}</td>
                  <td className="p-4 font-bold">
                    {new Date(trip.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-4 font-black text-green-600">
                    ₹{trip.totalIncome.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-black uppercase text-xs px-3 py-1 border-2 border-black ${
                        trip.paymentStatus === "Cleared"
                          ? "bg-green-400"
                          : "bg-orange-400"
                      }`}
                    >
                      {trip.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/trip/${trip._id}`)}
                      className="bg-yellow-400 border-2 border-black px-3 py-1 font-bold text-xs uppercase hover:bg-black hover:text-yellow-400 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="md:hidden">
          {recentTrips.map((trip) => (
            <div key={trip._id} className="border-t-4 border-black p-4 bg-white">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg">{trip.Vehicle_Number}</p>
                  <p className="font-bold text-xs text-gray-600 break-words overflow-wrap-anywhere">
                    {trip.route}
                  </p>
                </div>
                <span
                  className={`font-black uppercase text-xs px-2 py-1 border-2 border-black whitespace-nowrap flex-shrink-0 ${
                    trip.paymentStatus === "Cleared"
                      ? "bg-green-400"
                      : "bg-orange-400"
                  }`}
                >
                  {trip.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-600">
                    Income
                  </p>
                  <p className="font-black text-xl text-green-600">
                    ₹{trip.totalIncome.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/trip/${trip._id}`)}
                  className="bg-yellow-400 border-2 border-black px-4 py-2 font-bold text-sm uppercase hover:bg-black hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  View
                </button>
              </div>
              <p className="text-xs font-bold text-gray-500 mt-2">
                {new Date(trip.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t-4 border-black p-4 bg-stone-50 text-center">
          <Link to="/all-trips"
            className="font-black uppercase text-sm underline decoration-4 decoration-black hover:text-yellow-600 transition-colors"
          >
            View All Trips ({trips.length}) →
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-white border-4 border-black p-6 font-black uppercase text-left hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
          <BarChart3 className="mb-2" size={32} strokeWidth={3} />
          Generate Report
        </button>
        <button className="bg-white border-4 border-black p-6 font-black uppercase text-left hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
          <Truck className="mb-2" size={32} strokeWidth={3} />
          Manage Vehicles
        </button>
        <button className="bg-white border-4 border-black p-6 font-black uppercase text-left hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
          <Settings className="mb-2" size={32} strokeWidth={3} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
