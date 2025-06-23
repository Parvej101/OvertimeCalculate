/**
 * এই ফাংশনটি ইন-টাইম, আউট-টাইম এবং স্ট্যান্ডার্ড ডিউটি টাইম থেকে
 * মোট ডিউটি ঘন্টা এবং ওভারটাইম ঘন্টা হিসাব করে।
 * @param {string} dateString - তারিখ (e.g., "2023-12-25")
 * @param {string} inTimeString - ইন-টাইম (e.g., "09:00")
 * @param {string} outTimeString - আউট-টাইম (e.g., "19:30")
 * @param {number} standardDutyMinutes - ওই এমপ্লয়ীর জন্য নির্ধারিত মোট ডিউটি মিনিট (e.g., 550)
 * @returns {object} - একটি অবজেক্ট যাতে dutyHours, overtimeHours, inTime (Date), outTime (Date) থাকে।
 */
export function calculateOvertime(dateString, inTimeString, outTimeString, standardDutyMinutes) {
  // যদি কোনো একটি ভ্যালু না থাকে, তাহলে হিসাব না করে খালি রিটার্ন করা
  if (!inTimeString || !outTimeString || !standardDutyMinutes) {
    return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };
  }

  // তারিখ এবং সময়কে একত্রিত করে একটি পূর্ণাঙ্গ Date অবজেক্ট তৈরি করা
  // যেমন: "2023-12-25" এবং "09:00" মিলে new Date("2023-12-25T09:00:00") তৈরি হবে
  const inTime = new Date(`${dateString}T${inTimeString}:00`);
  const outTime = new Date(`${dateString}T${outTimeString}:00`);

  // যদি আউট-টাইম ইন-টাইমের চেয়ে কম হয় (যেমন, রাত ১২টার পর আউট),
  // তাহলে আউট-টাইমের সাথে একদিন যোগ করা হয়।
  // উদাহরণ: In-time 21:00 (রাত ৯টা), Out-time 02:00 (রাত ২টা)
  if (outTime < inTime) {
    outTime.setDate(outTime.getDate() + 1);
  }

  // দুই সময়ের মধ্যে মিনিটের পার্থক্য বের করা
  const totalMinutes = (outTime.getTime() - inTime.getTime()) / (1000 * 60);

  // যদি মোট মিনিট ঋণাত্মক হয় (ইনপুট ভুল), তাহলে ০ রিটার্ন করা
  if (totalMinutes < 0) {
    return { dutyHours: 0, overtimeHours: 0, inTime: null, outTime: null };
  }

  let overtimeMinutes = 0;
  // যদি মোট কাজ করার সময় স্ট্যান্ডার্ড ডিউটি টাইমের চেয়ে বেশি হয়
  if (totalMinutes > standardDutyMinutes) {
    overtimeMinutes = totalMinutes - standardDutyMinutes;
  }

  // মিনিটকে ঘন্টায় রূপান্তর করা (দশমিকের পর ২ ঘর পর্যন্ত)
  const dutyHours = parseFloat((totalMinutes / 60).toFixed(2));
  const overtimeHours = parseFloat((overtimeMinutes / 60).toFixed(2));

  return { dutyHours, overtimeHours, inTime, outTime };
}