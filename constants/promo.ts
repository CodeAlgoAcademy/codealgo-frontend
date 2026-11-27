// The sale shown in the banner above the public navbar
// (components/home/new-home/SaleBanner.tsx).
//
// The banner only advertises the code. The discount itself comes from a coupon
// and promotion code with this exact name created in the backend admin; if that
// does not exist, checkout rejects the code.
//
// To end the sale early, set `endsAt` to a past date. To run another sale,
// change the three values and the banner text in locales/*/home.json.
export const SALE = {
   code: "HOLIDAY",
   percentOff: 30,
   // Where "Claim offer" goes: the one-page signup built for the ad campaign.
   // That page applies its own 30% code (MOKS30) automatically. Add
   // "?code=HOLIDAY" here to make it use this sale's code instead, once the
   // HOLIDAY promotion code exists in the backend admin.
   claimUrl: "/join/midwest",
   // The banner stops showing after this moment: end of Monday Nov 30, 2026 (US Central).
   endsAt: "2026-12-01T06:00:00Z",
};
