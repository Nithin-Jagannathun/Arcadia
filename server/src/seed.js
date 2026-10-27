import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import Assignment from './models/Assignment.js';
import Doodle from './models/Doodle.js';
import Goal from './models/Goal.js';
import Idea from './models/Idea.js';
import User from './models/User.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Seeding demo data...');

    // Demo User
    const demoEmail = 'alex@arcadia.edu';
    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      user = await User.create({
        name: 'Alex Rivera',
        email: demoEmail,
        password: 'password123',
        deadlineWarningDays: 3,
        theme: 'dark',
      });
      console.log('[Seed] Created demo user: alex@arcadia.edu / password123');
    }

    const userId = user._id;

    // Clean existing user data
    await Promise.all([
      Assignment.deleteMany({ user: userId }),
      Goal.deleteMany({ user: userId }),
      Idea.deleteMany({ user: userId }),
      Doodle.deleteMany({ user: userId }),
    ]);

    const now = new Date();

    // 1. Seed Goals
    const goal1 = await Goal.create({
      user: userId,
      title: 'Distributed Systems Capstone Project',
      description: 'Design and benchmark a fault-tolerant Raft consensus key-value store in Go.',
      category: 'Academics',
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      targetDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      milestones: [
        {
          title: 'RPC Leader Election & Heartbeat Protocol',
          completed: true,
          completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Log Replication & Safety Invariant Validation',
          completed: true,
          completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Cluster Membership Changes & Log Compaction',
          completed: false,
        },
        {
          title: 'Chaos Monkey Partition Benchmarks & Final Report',
          completed: false,
        },
      ],
    });

    const goal2 = await Goal.create({
      user: userId,
      title: 'Summer 2027 SWE Internship Preparation',
      description: 'Master data structures, algorithms, and system design interviews.',
      category: 'Career',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      targetDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      milestones: [
        {
          title: 'Complete NeetCode 150 Core Patterns',
          completed: true,
          completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'System Design Primer (Caching, Sharding, Load Balancers)',
          completed: false,
        },
        {
          title: 'Conduct 5 Mock Peer Interviews',
          completed: false,
        },
      ],
    });

    // 2. Seed Assignments
    await Assignment.create([
      // Overdue item (deadline 1 day ago)
      {
        user: userId,
        title: 'Problem Set 4: Dynamic Programming & Network Flow',
        description: 'Complete problems 1 through 6 on Edmonds-Karp and Min-Cut invariants.',
        course: 'CS301 Algorithms',
        deadline: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        priority: 'High',
        status: 'In Progress',
        type: 'Individual',
        estimatedHours: 4,
      },
      // Due Soon (1 day in future - within warning window)
      {
        user: userId,
        title: 'Lab 3: Raft Log Replication Verification',
        description: 'Pass 2B test harness with 0 race conditions using -race flag.',
        course: 'CS401 Distributed Systems',
        deadline: new Date(now.getTime() + 28 * 60 * 60 * 1000),
        priority: 'High',
        status: 'In Progress',
        type: 'Group',
        estimatedHours: 6,
        goalId: goal1._id,
      },
      // Due Soon (2.5 days in future - within warning window)
      {
        user: userId,
        title: 'Quiz 2: Relational Schema Normalization (BCNF & 3NF)',
        description: 'Online timed quiz on Canvas covering Armstrong axioms.',
        course: 'CS315 Databases',
        deadline: new Date(now.getTime() + 60 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'Not Started',
        type: 'Individual',
        estimatedHours: 2,
      },
      // Future upcoming (7 days in future)
      {
        user: userId,
        title: 'Term Paper: Transformer Self-Attention Mechanisms',
        description: '8-page literature review surveying sparse attention architectures.',
        course: 'CS450 Deep Learning',
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'Not Started',
        type: 'Individual',
        estimatedHours: 12,
      },
      // Submitted this week
      {
        user: userId,
        title: 'Lab 2: Virtual Memory & Page Fault Handlers',
        description: 'Submitted to grading autograder. Received 100/100.',
        course: 'CS302 Operating Systems',
        deadline: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        priority: 'High',
        status: 'Submitted',
        type: 'Individual',
        estimatedHours: 8,
      },
    ]);

    // 3. Seed Ideas
    await Idea.create([
      {
        user: userId,
        title: 'Campus Food Pantry Real-time Inventory Tracker',
        description:
          'A lightweight PWA for campus pantry volunteers to scan barcodes and update live stock levels for student visitors.',
        category: 'Projects',
        tags: ['react', 'pwa', 'community', 'campus'],
        planningStatus: 'Exploring',
        pinned: true,
      },
      {
        user: userId,
        title: 'Autonomous Quadcopter Optical Flow Positioning',
        description:
          'Investigate whether cheap PMW3901 sensors can maintain sub-meter drift indoors without GPS.',
        category: 'Research',
        tags: ['robotics', 'embedded', 'iot'],
        planningStatus: 'Brainstorming',
        pinned: false,
      },
      {
        user: userId,
        title: 'Peer Code Review Study Circle for CS401',
        description:
          'Organize bi-weekly 45-min Zoom sessions before major lab deadlines to critique system architectures.',
        category: 'Academics',
        tags: ['study-group', 'cs401'],
        planningStatus: 'Planned',
        pinned: false,
      },
    ]);

    // 4. Seed Doodle
    const sampleGrid16 = Array(16 * 16).fill('');
    // Draw a cute retro sword / heart emblem in grid
    const heartIndices = [
      16 * 4 + 6, 16 * 4 + 7, 16 * 4 + 9, 16 * 4 + 10,
      16 * 5 + 5, 16 * 5 + 6, 16 * 5 + 7, 16 * 5 + 8, 16 * 5 + 9, 16 * 5 + 10, 16 * 5 + 11,
      16 * 6 + 5, 16 * 6 + 6, 16 * 6 + 7, 16 * 6 + 8, 16 * 6 + 9, 16 * 6 + 10, 16 * 6 + 11,
      16 * 7 + 6, 16 * 7 + 7, 16 * 7 + 8, 16 * 7 + 9, 16 * 7 + 10,
      16 * 8 + 7, 16 * 8 + 8, 16 * 8 + 9,
      16 * 9 + 8,
    ];
    heartIndices.forEach((idx) => {
      sampleGrid16[idx] = '#f43f5e';
    });

    await Doodle.create({
      user: userId,
      name: 'Arcadia Heart Emblem',
      gridSize: 16,
      gridData: sampleGrid16,
    });

    console.log('✓ [Seed] Demo database seeding completed successfully!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('✗ [Seed] Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
