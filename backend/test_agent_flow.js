
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const understandingAgent = require('./src/agents/understandingAgent');

const transcript = `
David Anyanwu: Good afternoon, everyone. Thanks for joining. Let’s get started. Today’s agenda is to review the Loyal Link platform progress, discuss any blockers, and finalize tasks for the upcoming sprint.

Emeka Obi: Sure. On the development side, the backend integration with Supabase is complete. OTP verification for account creation and password reset works as expected.

Chioma Ude: On the design front, the landing page, account creation page, and OTP verification pages are ready for review. I’ve made sure the color scheme and fonts match the brand guidelines.

Ada Nnaji: For marketing, I’ve prepared the content for the platform overview and the loyalty program. I also drafted a short video script for onboarding new users.

David Anyanwu: Great. Emeka, any blockers on your side?

Emeka Obi: The only issue is delaying the business registration data until after email verification. Right now, I’m storing it temporarily in localStorage, but I want to make sure that works reliably across browsers.

Chioma Ude: I can test the flow on Chrome, Edge, and Firefox to confirm.

David Anyanwu: Perfect. Ada, for the onboarding video, make sure it highlights the point transfer system — users should understand they can share points.

Ada Nnaji: Got it. I’ll align the visuals with Chioma’s UI designs so it matches the interface.

David Anyanwu: For the sprint, let’s prioritize:

Complete cross-browser testing of the OTP and registration flow.

Finalize the onboarding video draft.

Prepare hackathon presentation slides with visuals of the dashboard and loyalty system.

Emeka Obi: I’ll also prepare a small demo showing point transfers for the hackathon slides.

Chioma Ude: I can add the UI mockups and screenshots for that.

David Anyanwu: Excellent. Any other concerns?

Ada Nnaji: I suggest we schedule a review session mid-week to check progress on all fronts before the final presentation.

David Anyanwu: Agreed. Let’s set that for Wednesday at 3 PM. If there’s nothing else, we’ll adjourn. Thanks, everyone, for your updates.

Meeting Adjourned: 3:15 PM
`;

async function runTest() {
  console.log('Testing Understanding Agent...');
  try {
    const result = await understandingAgent.process(transcript);
    console.log('Result obtained. Writing to debug_response.json...');
    fs.writeFileSync('debug_response.json', JSON.stringify(result, null, 2));
    console.log('Done.');
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

runTest();
