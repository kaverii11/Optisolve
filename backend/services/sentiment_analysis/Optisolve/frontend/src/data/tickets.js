export const tickets = [
    {
        id: 4092,
        user: "John Doe",
        avatar: "JD",
        snippet: "Login Failure - Urgent",
        status: "urgent",
        badges: [
            { label: "Sentiment Penalty applied", color: "red" },
            { label: "Requires Approval", color: "orange" },
        ],
        timestamp: "Mar 10, 2026 · 11:42 AM",
        messages: [
            {
                from: "user",
                name: "John Doe",
                time: "11:42 AM",
                text: "I've been trying to log in for 3 hours! Your system is completely broken and I'm losing money. Fix this NOW!",
                sentiment: "angry",
            },
        ],
        ai: {
            baseRetrieval: 92,
            sentimentModifier: -35,
            finalScore: 57,
            status: "Escalated",
            draft:
                "Dear John,\n\nI sincerely apologize for the frustration you're experiencing. I completely understand how critical access to your account is, and I'm sorry for the inconvenience this has caused.\n\nI've investigated your login issue and identified the root cause. To restore your access immediately, please use the secure password reset link below:\n\n🔗 https://optisolve.app/reset?token=jd-4092-secure\n\nThis link is valid for 30 minutes. Once you've reset your password, you should be able to log in right away. If you continue to experience any issues, I'll personally ensure this is escalated to our engineering team for an immediate fix.\n\nThank you for your patience, and again, I'm sorry for the disruption.",
        },
    },
    {
        id: 4091,
        user: "Sarah Chen",
        avatar: "SC",
        snippet: "Billing question about Pro plan upgrade",
        status: "active",
        badges: [{ label: "Auto-Resolved", color: "green" }],
        timestamp: "Mar 10, 2026 · 10:15 AM",
        messages: [
            {
                from: "user",
                name: "Sarah Chen",
                time: "10:15 AM",
                text: "Hi, I was charged twice for the Pro plan upgrade. Could you look into this?",
                sentiment: "neutral",
            },
        ],
        ai: {
            baseRetrieval: 97,
            sentimentModifier: 0,
            finalScore: 97,
            status: "Auto-Resolved",
            draft: "Hi Sarah, I've reviewed your billing and confirmed the duplicate charge. A refund has been initiated.",
        },
    },
    {
        id: 4090,
        user: "Mike Rivera",
        avatar: "MR",
        snippet: "API rate limit configuration help",
        status: "pending",
        badges: [{ label: "Awaiting Response", color: "blue" }],
        timestamp: "Mar 10, 2026 · 9:30 AM",
        messages: [
            {
                from: "user",
                name: "Mike Rivera",
                time: "9:30 AM",
                text: "I need help configuring rate limits for our enterprise API integration.",
                sentiment: "neutral",
            },
        ],
        ai: {
            baseRetrieval: 88,
            sentimentModifier: 0,
            finalScore: 88,
            status: "Confident",
            draft: "Hi Mike, I'd be happy to help with your rate limit configuration. Here's a guide for enterprise API settings...",
        },
    },
];
