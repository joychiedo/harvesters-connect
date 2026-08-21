# Harvesters Outreach Connect

Build a REAL, production-ready outreach management application for:

HARVESTERS INTERNATIONAL CHRISTIAN CENTRE

This is NOT a mockup, prototype, concept dashboard, or UI demonstration.

It is intended to be used by real church volunteers and leaders during an actual feeding outreach.

The application must therefore have REAL persistent data storage, REAL form submission, REAL validation, REAL error handling, REAL search/filtering, and REAL CRUD functionality.

Do not populate the application with fake people.

Do not use mock/sample people as the database.

Do not create buttons that visually appear to work but do nothing.

Every important interaction must actually work.

1. ORGANIZATION

Organization name:

Harvesters International Christian Centre

Use the correct church name consistently throughout the application.

Do not call it simply "Harvesters".

The application should feel like an official internal tool for Harvesters International Christian Centre.

The current outreach is:

Feeding Outreach

Date:

Saturday, 22 August 2026

Location:

Harbatuer, Odieran Market, Bariga

Target:

500 souls

2. RESEARCH THE CHURCH FIRST

Before designing the application, research the official Harvesters International Christian Centre website and use it as the primary source for:

Correct organization name

Church branding

Logo

Brand colours

Campus/branch names

Relevant outreach information

Existing outreach photography where legally/officially available

General visual identity

Primary official website:

https://harvestersng.org/

Relevant official pages include:

Official homepage

About Harvesters

Campus Locations

Missions & Outreach

Official media/pages

Do NOT invent church branches.

Do NOT use random logos from Google.

Do NOT use the Lovable logo.

Do NOT use a generic church icon.

3. HARVESTERS LOGO + FAVICON

The favicon MUST NOT be the default Lovable favicon.

Replace the Lovable favicon with the official Harvesters International Christian Centre logo/mark if it is available from an official Harvesters source.

Use the official Harvesters branding throughout the application.

Include:

Browser favicon

App icon

Login branding

Sidebar branding

Mobile header branding

The logo should be used tastefully.

Do not place the logo everywhere.

4. HARVESTERS CAMPUSES / BRANCHES

Create a proper campus/branch structure.

Use verified official information from Harvesters' current website.

The current official site identifies locations including:

Lekki

Gbagada

Anthony

Magodo

Ibadan

Abuja

Alimosho

Ikorodu

Yaba

London

Ikeja GRA

The official campus/channel information also references locations such as:

Ajah

Isolo

Ikeja

Ikoyi

Ilupeju

Birmingham

Manchester

Do not blindly duplicate outdated information.

Research the current official Harvesters location information before creating the final branch list.

Create a reusable CAMPUS table/entity rather than hard-coding branches into random dropdowns.

Each campus should have:

id

name

location

country

active status

The system should allow an administrator to add/edit campuses later.

5. REAL DATABASE — ABSOLUTELY REQUIRED

This is the most important technical requirement.

Connect the application to a real persistent backend/database.

Prefer Supabase if it is available and appropriate for this Lovable project.

DO NOT use:

Static arrays as the database

Fake JSON data

localStorage as the primary database

sessionStorage as the database

Hardcoded records

Temporary mock state

Data must survive:

Page refresh

Browser closing

Different devices

Different users

Deployment

Netlify redeployment

If Supabase is available, create the required tables and relationships properly.

If Supabase is not yet connected, clearly identify the required connection/setup rather than pretending that the application is production-ready.

6. DATABASE STRUCTURE

Create a sensible relational structure.

At minimum:

outreach_events

Fields:

id

name

date

location

target_count

description

created_at

updated_at

created_by

Example:

Feeding Outreach
22 August 2026
Harbatuer, Odieran Market, Bariga
500

campuses

Fields:

id

name

location

country

active

created_at

updated_at

people

Fields:

id

full_name

phone

alternate_phone

gender

age_group

location

campus

outreach_event_id

registered_by

registration_date

follow_up_status

assigned_leader

cell

zone

interested_in_church

accepted_christ

prayer_request

ministry_interest

preferred_contact_method

notes

created_at

updated_at

Do NOT make unnecessary fields mandatory.

The registration process needs to be fast.

follow_ups

Fields:

id

person_id

assigned_to

status

contact_date

contact_method

outcome

next_action

next_follow_up_date

notes

created_at

updated_at

volunteers

Fields:

id

full_name

phone

campus

role

active

created_at

users / staff

Use proper authentication.

Users should have roles such as:

Administrator

Zonal Leader

Cell Leader

Follow-up Leader

Volunteer

Do not give every user unrestricted access.

7. PRIVACY AND ACCESS

This application contains personal information.

Treat it as sensitive operational information.

Implement authentication.

Unauthenticated visitors should NOT be able to see the people database.

Users should only see the data appropriate to their role.

At minimum:

Administrator

Can:

View all records

Add/edit/delete records

Manage users

Manage campuses

Manage outreach events

Export records

Zonal Leader

Can:

View relevant people

Assign follow-up

Update follow-up records

Add notes

Cell Leader

Can:

View assigned people

Update follow-up

Add notes

Volunteer

Can:

Register people

View the records necessary for their work

NOT access sensitive administrative settings

Implement proper database-level access policies where the backend supports them.

8. NO MOCK DATA

Do not generate 40 fake people.

Do not create fake Nigerian names.

Do not create placeholder phone numbers.

Do not make the dashboard look populated with fictional records.

The real database should initially be EMPTY.

Instead, create excellent empty states.

Example:

"Nobody has been registered for this outreach yet."

Then:

"Add first person"

The dashboard should show:

0 people reached
0 follow-ups
0 assigned
0 completed

This is the correct behaviour for a real system.

9. REGISTRATION EXPERIENCE

This is the most important workflow.

A volunteer should be able to register someone in approximately 30–60 seconds.

Create a highly usable registration screen.

Required fields should be minimal.

Person

Full name
Phone number
Gender
Age group
Location

Outreach

Outreach event
Campus/branch
Registered by

Follow-up

Interested in follow-up?
Would like someone to contact them?
Preferred contact method?

Ministry

Prayer request
Ministry interest
Notes

Optional:

Accepted Christ

Do not force volunteers to fill unnecessary information.

10. SAVE MUST ACTUALLY SAVE

When the volunteer clicks:

Save Person

the application must:

Validate the form

Send the data to the real database

Wait for the database response

Confirm successful insertion

Clear/reset the form appropriately

Update the dashboard/database count

Show a clear success message

Example:

"Person registered successfully."

If the database fails:

DO NOT pretend the record was saved.

Show:

"Unable to save this record. Please check your connection and try again."

Keep the entered information in the form so the volunteer does not have to type everything again.

This is extremely important.

11. SAVE & ADD ANOTHER

Add:

Save & Add Another

This should save the current person and immediately prepare a clean form for the next registration.

This is specifically designed for the outreach environment.

12. DUPLICATE PROTECTION

Prevent accidental duplicate records.

Before creating a new person, check for likely duplicates based on:

Phone number

Name + phone

Possibly name + location

If a likely duplicate exists, show:

"A person with this phone number already exists."

Then give options:

View existing record

Continue anyway

Cancel

Do not silently create duplicates.

13. PEOPLE DATABASE

Create a real searchable database.

Search by:

Name

Phone

Location

Filters:

Outreach event

Campus

Age group

Gender

Follow-up status

Assigned leader

Registration date

Sorting:

Newest

Oldest

Name

Follow-up priority

All filtering/searching must work against actual database records.

14. PERSON PROFILE

Clicking a person should open their actual database record.

Show:

Name
Phone
Gender
Age group
Location
Campus
Outreach
Registration date
Registered by
Follow-up status
Assigned leader
Prayer request
Ministry interest
Notes

Then show:

Follow-up history

Display actual follow-up records from the database.

Allow:

Add follow-up
Edit follow-up
Change status
Assign leader

15. FOLLOW-UP SYSTEM

Create a proper follow-up workspace.

Statuses:

New

Contacted

Follow-up scheduled

Connected

Unable to reach

Not interested

Completed

Do not make this purely visual.

Changing a status must update the database.

Adding a note must create a real follow-up record.

Assigning a leader must persist.

16. DASHBOARD

The dashboard must read its numbers from the REAL DATABASE.

Never hard-code:

"324 people"

or any other number.

Show:

People reached
Outreach target
Remaining
Follow-ups pending
Follow-ups completed
Unassigned people
Prayer requests

For the current outreach:

Target = 500

If 37 real people have been registered:

37 / 500

The numbers must update automatically.

17. REAL-TIME UPDATES

If multiple volunteers are using the system simultaneously, the application should update when possible.

For example:

Volunteer A registers someone.

Volunteer B should be able to see the new record without needing to manually recreate it.

Use real-time database subscriptions if supported by the chosen backend.

At minimum, provide reliable refresh/revalidation.

18. OFFLINE / POOR CONNECTION HANDLING

This may be used at a market/outreach location where internet connectivity can be unreliable.

Design for poor network conditions.

If feasible, implement a safe offline queue:

User enters person

Record is temporarily marked "Pending sync"

Once connection returns, it synchronizes with the database

User can clearly see sync status

Do NOT claim offline functionality unless it actually works.

If implementing offline sync is too complex for the first version, provide a clear connection error and preserve the form contents instead.

Never silently lose entered data.

19. OUTREACH EVENTS

Create an Outreach Events page.

Admins can:

Create event

Edit event

View event

Archive event

Each event should contain:

Name
Date
Location
Target
Description

The current event should be:

Feeding Outreach
Saturday, 22 August 2026
Harbatuer, Odieran Market, Bariga
Target: 500

Do not hard-code this as the only possible event.

Future outreach events should be possible.

20. CAMPUS SELECTION

When registering a person, allow the volunteer to select the relevant Harvesters campus/branch.

Do NOT require the person being registered to belong to a campus if that is unknown.

Allow:

Not assigned

as a valid state.

21. REPORTING

Create a simple reporting section based entirely on actual records.

Show:

Total people reached

People by campus

People by age group

People by gender

Follow-up status

People requiring follow-up

People without assignment

Prayer requests

Outreach progress

Do not create meaningless decorative charts.

Every number shown must come from the database.

22. EXPORT

Provide:

Export CSV

The export should contain the actual database records currently accessible to the logged-in user.

Do not export records the user does not have permission to access.

23. CHURCH BRANDING

Research Harvesters' official visual identity.

Use the official Harvesters logo where permitted and available from official sources.

Use the organization's real brand character.

Do not turn the application into a flashy church promotional website.

This is an internal administrative tool.

The branding should be subtle:

Harvesters International Christian Centre

with a clean, professional interface.

24. OUTREACH HISTORY / PHOTOGRAPHS

Research the official Harvesters website for previous outreach activity.

Harvesters has an official Missions & Outreach section and specifically documents the End Hunger Initiative.

If there are suitable publicly available official Harvesters outreach photographs from official Harvesters channels, use a small number of them in an appropriate "Outreach" or "About this initiative" area.

Only use images from official/public Harvesters sources or assets that are clearly appropriate for reuse.

Do not scrape random images from unrelated websites.

Do not invent outreach photographs.

Do not create AI-generated people pretending they are real Harvesters volunteers or beneficiaries.

If suitable official images cannot be reliably sourced, use a restrained image placeholder area and do not fabricate photography.

25. OUTREACH CONTEXT

Include a small, respectful section explaining the purpose of the initiative.

Use verified information from Harvesters' official Missions & Outreach material.

The official Harvesters website describes its End Hunger Initiative as providing food directly to people in need.

Keep this section factual and concise.

Do not invent statistics.

Do not invent previous outreach results.

Do not invent testimonies.

26. DESIGN LANGUAGE

This is NOT a marketing landing page.

It is an internal operations application.

Therefore:

NO:

Neon

Purple AI gradients

Glassmorphism

Huge headings

Floating blobs

Excessive rounded cards

Cartoon illustrations

Fake AI imagery

Excessive animations

Excessive shadows

Over-designed charts

YES:

Strong information hierarchy

Neutral backgrounds

Restrained Harvesters branding

Excellent typography

Clear forms

Good spacing

Thin borders

Small/moderate corner radius

Functional tables

Excellent mobile usability

Clear states

Quiet interactions

It should feel mature and human-designed.

27. MOBILE-FIRST OUTREACH MODE

The registration experience should be optimized specifically for a volunteer standing at the outreach venue using a phone.

Make:

Add Person

extremely easy to access.

The registration form should not require excessive scrolling.

Use large enough touch targets.

Avoid complicated menus.

Provide clear success/error feedback.

Keep the most important fields first.

28. ERROR HANDLING

Every database operation needs proper error handling.

Examples:

Database unavailable
Authentication expired
Duplicate record
Invalid phone number
Missing required field
Permission denied
Network failure

Never show:

"Success"

unless the backend actually confirmed success.

Never silently fail.

Never erase user-entered information because of an error.

29. LOADING STATES

When saving:

Button should change to:

Saving...

Disable duplicate submission.

After success:

Saved

Then return to normal state.

For database lists:

Use subtle loading states.

Do not use dramatic animations.

30. EMPTY STATES

Because this is a REAL database, the initial dashboard may have no records.

Design this beautifully.

Example:

No people registered yet

Start recording the people reached during this outreach.

[Add first person]

This is much better than filling the dashboard with fake people.

31. AUTHENTICATION

Create a secure login experience.

Use email/password or the authentication mechanism supported by the chosen backend.

After login, show the user's:

Name
Role
Campus

Provide logout.

Protect all administrative routes.

32. AUDITABILITY

Where practical, record:

Created by

Created at

Updated by

Updated at

This is important because multiple volunteers/leaders may work with the records.

33. DATABASE SECURITY

Do not expose database credentials in client-side code.

Use environment variables/secrets correctly.

If using Supabase:

Configure authentication

Configure Row Level Security

Create appropriate policies

Never expose service-role keys in browser code

Use the public/anon key only where appropriate

The application must be safe to deploy.

34. FAVICON AND METADATA

Set:

Harvesters favicon

Proper page title

Proper application name

Appropriate metadata

Browser title should be something like:

Harvesters Outreach | Harvesters International Christian Centre

Do not leave:

"Lovable App"

or generic Vite titles.

35. DO NOT BREAK EXISTING PROJECT

Inspect the existing project before making changes.

Do not unnecessarily rewrite the entire application.

Preserve useful existing architecture where possible.

Do not add duplicate Vite/TanStack plugins.

Do not modify Lovable's existing Vite configuration unless absolutely necessary.

Do not introduce unnecessary dependencies.

36. TEST EVERYTHING BEFORE FINISHING

This is mandatory.

Before saying the project is complete, test:

Login

Add person

Validation

Successful database save

Failed database save

Save & Add Another

Search

Filters

Edit person

Follow-up creation

Follow-up status change

Assignment

Dashboard statistics

Outreach event creation

Campus selection

CSV export

Logout

Mobile layout

Do not tell me something is functional if it has not actually been implemented.

37. FINAL QUALITY STANDARD

This should look like a real product that Harvesters International Christian Centre could hand to its outreach team.

Not:

"Look what AI generated."

Instead:

"This is a simple, reliable tool our volunteers can actually use."

The design should be mature, restrained and professional.

The functionality is more important than visual effects.

Most importantly:

REAL DATA. REAL DATABASE. REAL SAVE. REAL ERROR HANDLING. REAL AUTHENTICATION. REAL SEARCH. REAL FOLLOW-UP.

Do not populate the system with fake people merely to make screenshots look impressive.

Build the actual foundation correctly.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/56c0e844-fa6a-41d1-b61f-b4beec593c86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
