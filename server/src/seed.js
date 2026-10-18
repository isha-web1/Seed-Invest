import "dotenv/config";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import User from "./models/User.js";
import Campaign from "./models/Campaign.js";

const run = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@seedinvest.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123";

  let admin = await User.findOne({ user_email: adminEmail });
  if (!admin) {
    admin = await User.create({
      display_name: "Platform Admin",
      user_email: adminEmail,
      photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
      password: adminPassword,
      role: "admin",
      credits: 0,
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  const creatorEmail = "demo.creator@seedinvest.com";
  let creator = await User.findOne({ user_email: creatorEmail });
  if (!creator) {
    creator = await User.create({
      display_name: "Demo Creator",
      user_email: creatorEmail,
      photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Creator",
      password: "Creator123",
      role: "creator",
      credits: 20,
    });
    console.log(`Demo creator created: ${creatorEmail} / Creator123`);
  }

  const supporterEmail = "demo.supporter@seedinvest.com";
  let supporter = await User.findOne({ user_email: supporterEmail });
  if (!supporter) {
    supporter = await User.create({
      display_name: "Demo Supporter",
      user_email: supporterEmail,
      photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Supporter",
      password: "Supporter123",
      role: "supporter",
      credits: 50,
    });
    console.log(`Demo supporter created: ${supporterEmail} / Supporter123`);
  }

  const campaignCount = await Campaign.countDocuments();
  if (campaignCount === 0) {
    const samples = [
      {
        campaign_title: "Solar-Powered Water Pump for Rural Farms",
        campaign_story:
          "We are building affordable solar-powered water pumps to help small farms irrigate crops without relying on diesel.",
        category: "Technology",
        funding_goal: 5000,
        minimum_contribution: 20,
        reward_info: "Backers get a digital thank-you badge and early access updates.",
        campaign_image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200",
        amount_raised: 3200,
        status: "approved",
      },
      {
        campaign_title: "Community Art Mural Project",
        campaign_story:
          "A neighbourhood-led mural celebrating local history, painted by youth artists.",
        category: "Art",
        funding_goal: 2000,
        minimum_contribution: 10,
        reward_info: "Your name on the donor wall and a printed postcard set.",
        campaign_image_url: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=1200",
        amount_raised: 1500,
        status: "approved",
      },
      {
        campaign_title: "Mobile Health Clinic for Remote Villages",
        campaign_story:
          "Bringing basic healthcare and vaccinations to villages with no nearby clinic.",
        category: "Health",
        funding_goal: 8000,
        minimum_contribution: 50,
        reward_info: "Quarterly impact reports and recognition in our annual review.",
        campaign_image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200",
        amount_raised: 6100,
        status: "approved",
      },
    ];

    const now = Date.now();
    const created = await Campaign.insertMany(
      samples.map((s, i) => ({
        ...s,
        creator_email: creator.user_email,
        creator_name: creator.display_name,
        deadline: new Date(now + (30 + i * 15) * 24 * 60 * 60 * 1000),
      }))
    );
    console.log(`Seeded ${created.length} sample campaigns.`);
  }

  await mongoose.connection.close();
  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
