"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Plus,
  Trash2,
  Phone,
  Mail,
  Globe,
  FileCheck,
  CheckCircle,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";
import { EventPlan, Vendor, VendorStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface VendorsTabProps {
  event: EventPlan;
  onAddVendor: (vendor: Omit<Vendor, "id">) => Promise<void>;
  onUpdateVendor: (vendorId: string, updates: Partial<Vendor>) => Promise<void>;
  onDeleteVendor: (vendorId: string) => Promise<void>;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({
  event,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // New Vendor Form State
  const [vendorCategory, setVendorCategory] = useState("Catering & Bar");
  const [vendorName, setVendorName] = useState("");
  const [vendorContactName, setVendorContactName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorWebsite, setVendorWebsite] = useState("");
  const [vendorQuotedPrice, setVendorQuotedPrice] = useState("");
  const [vendorFinalPrice, setVendorFinalPrice] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");

  const bookedCount = event.vendors.filter(
    (v) => v.status === "booked" || v.status === "completed"
  ).length;

  const totalQuoted = event.vendors.reduce(
    (sum, v) => sum + (v.finalPrice ?? v.quotedPrice ?? 0),
    0
  );

  const filteredVendors = event.vendors.filter((v) => {
    if (filterStatus === "all") return true;
    return v.status === filterStatus;
  });

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName) return;

    await onAddVendor({
      category: vendorCategory,
      name: vendorName.trim(),
      contactName: vendorContactName.trim() || undefined,
      phone: vendorPhone.trim() || undefined,
      email: vendorEmail.trim() || undefined,
      website: vendorWebsite.trim() || undefined,
      quotedPrice: parseFloat(vendorQuotedPrice) || 0,
      finalPrice: vendorFinalPrice ? parseFloat(vendorFinalPrice) : undefined,
      status: "researching",
      contractSigned: false,
      depositPaid: false,
      notes: vendorNotes.trim() || undefined,
    });

    setVendorName("");
    setVendorContactName("");
    setVendorPhone("");
    setVendorEmail("");
    setVendorWebsite("");
    setVendorQuotedPrice("");
    setVendorFinalPrice("");
    setVendorNotes("");
    setShowAddVendorModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-black">
      {/* Top 3 Pastel Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-black bg-[#fcd2c2] p-5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs text-black font-black">Total Vendors Needed</span>
          <div className="mt-2 text-2xl font-black text-black">{event.vendors.length}</div>
          <p className="mt-1 text-xs font-bold text-slate-800">Targeting {event.eventType.replace("_", " ")} services</p>
        </div>
        <div className="rounded-2xl border-2 border-black bg-[#c7f7d4] p-5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs text-black font-black">Locked In / Booked</span>
          <div className="mt-2 text-2xl font-black text-black">{bookedCount}</div>
          <p className="mt-1 text-xs font-bold text-slate-800">Contracts active</p>
        </div>
        <div className="rounded-2xl border-2 border-black bg-[#eefc27] p-5 shadow-[4px_4px_0px_0px_#000]">
          <span className="text-xs text-black font-black">Total Quoted Commitments</span>
          <div className="mt-2 text-2xl font-black text-black">
            {formatCurrency(totalQuoted, event.currency)}
          </div>
          <p className="mt-1 text-xs font-bold text-slate-800">Across all bids</p>
        </div>
      </div>

      {/* Filter and CTA Bar in Neobrutalist Style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-black bg-white p-1 text-xs shadow-[3px_3px_0px_0px_#000]">
          {[
            { id: "all", label: "All" },
            { id: "booked", label: "Booked" },
            { id: "quote_received", label: "Quotes" },
            { id: "contacted", label: "Contacted" },
            { id: "researching", label: "Researching" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-xl px-3 py-1.5 font-black transition-all ${
                filterStatus === tab.id
                  ? "bg-[#eefc27] text-black border-1.5 border-black shadow-[1px_1px_0px_0px_#000]"
                  : "text-black hover:bg-[#faf8f2]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddVendorModal(true)}
          className="neo-btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
        >
          <Plus className="h-4 w-4 text-black" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendors Card Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full border-1.5 border-black bg-[#faf8f2] px-2.5 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0px_0px_#000]">
                    {vendor.category}
                  </span>
                  <h4 className="mt-2 text-base font-black text-black leading-tight">
                    {vendor.name}
                  </h4>
                  {vendor.contactName && (
                    <p className="text-xs font-bold text-slate-700 mt-0.5">Contact: {vendor.contactName}</p>
                  )}
                </div>

                {/* Status Dropdown */}
                <select
                  value={vendor.status}
                  onChange={(e) =>
                    onUpdateVendor(vendor.id, {
                      status: e.target.value as VendorStatus,
                    })
                  }
                  className="rounded-xl border-1.5 border-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[#faf8f2] text-black focus:outline-none shadow-[1px_1px_0px_0px_#000]"
                >
                  <option value="researching">Researching</option>
                  <option value="contacted">Contacted</option>
                  <option value="quote_received">Quote Received</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Price Details */}
              <div className="mt-4 rounded-xl border-2 border-black bg-[#faf8f2] p-3 flex items-center justify-between text-xs shadow-[1.5px_1.5px_0px_0px_#000]">
                <div>
                  <span className="text-[10px] text-slate-700 font-bold block">Quoted Price</span>
                  <span className="font-black text-black text-sm">
                    {formatCurrency(vendor.quotedPrice, event.currency)}
                  </span>
                </div>
                {vendor.finalPrice !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-700 font-bold block">Final Negotiated</span>
                    <span className="font-black text-black text-sm">
                      {formatCurrency(vendor.finalPrice, event.currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Toggles: Contract Signed & Deposit Paid */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateVendor(vendor.id, {
                      contractSigned: !vendor.contractSigned,
                    })
                  }
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold border-1.5 border-black shadow-[1px_1px_0px_0px_#000] transition-colors ${
                    vendor.contractSigned
                      ? "bg-[#c7f7d4] text-black"
                      : "bg-white text-slate-700"
                  }`}
                  title="Toggle contract signature status"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>{vendor.contractSigned ? "Contract Signed" : "No Contract"}</span>
                </button>

                <button
                  onClick={() =>
                    onUpdateVendor(vendor.id, {
                      depositPaid: !vendor.depositPaid,
                    })
                  }
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold border-1.5 border-black shadow-[1px_1px_0px_0px_#000] transition-colors ${
                    vendor.depositPaid
                      ? "bg-[#c7f7d4] text-black"
                      : "bg-white text-slate-700"
                  }`}
                  title="Toggle deposit paid status"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>{vendor.depositPaid ? "Deposit Paid" : "Deposit Due"}</span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-800 font-bold">
                {vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-black" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 text-black flex-shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-2 truncate text-blue-700 hover:underline">
                    <Globe className="h-3.5 w-3.5 flex-shrink-0 text-black" />
                    <span className="truncate">{vendor.website}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {vendor.notes && (
                <p className="mt-3 text-[11px] font-medium text-slate-800 italic bg-[#faf8f2] border-1.5 border-black rounded-xl p-2.5">
                  "{vendor.notes}"
                </p>
              )}
            </div>

            {/* Delete button */}
            <div className="pt-2 border-t-2 border-black/10 flex justify-end">
              <button
                onClick={() => onDeleteVendor(vendor.id)}
                className="text-xs text-slate-700 hover:text-rose-600 p-1 flex items-center gap-1 font-bold"
                title="Delete Vendor"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Vendor */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] animate-fade-in max-h-[90vh] overflow-y-auto text-black">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h4 className="text-lg font-black text-black">Add New Vendor</h4>
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="text-black hover:text-rose-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="text-black">Service Category</label>
                <select
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                >
                  <option value="Venue & Staging">Venue & Staging</option>
                  <option value="Catering & Bar">Catering & Bar</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Florals & Decor">Florals & Decor</option>
                  <option value="Music & Entertainment">Music & Entertainment</option>
                  <option value="Hair & Makeup">Hair & Makeup</option>
                  <option value="Rentals & Lighting">Rentals & Lighting</option>
                  <option value="Event Planning & Day-Of">Event Planning & Day-Of</option>
                  <option value="Security & Logistics">Security & Logistics</option>
                </select>
              </div>

              <div>
                <label className="text-black">Vendor / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Floral Studio, DJ Marcus"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={vendorContactName}
                    onChange={(e) => setVendorContactName(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
                <div>
                  <label className="text-black">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Email</label>
                  <input
                    type="email"
                    placeholder="contact@vendor.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
                <div>
                  <label className="text-black">Website / Portfolio</label>
                  <input
                    type="text"
                    placeholder="https://vendor.com"
                    value={vendorWebsite}
                    onChange={(e) => setVendorWebsite(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-black">Quoted Fee ({event.currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2400"
                    value={vendorQuotedPrice}
                    onChange={(e) => setVendorQuotedPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
                <div>
                  <label className="text-black">Agreed Final ({event.currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2200"
                    value={vendorFinalPrice}
                    onChange={(e) => setVendorFinalPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="text-black">Notes & Inclusions</label>
                <textarea
                  rows={2}
                  placeholder="Includes 8-hour coverage, 2 photographers, drone footage..."
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-black bg-[#faf8f2] p-2.5 text-black placeholder-slate-400 focus:outline-none shadow-[1.5px_1.5px_0px_0px_#000]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="neo-btn px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary px-5 py-2 text-xs font-black shadow-[3px_3px_0px_0px_#000]"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
