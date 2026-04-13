# Start Here, John

Hi John — this folder is the Merseyside Dairies clipboard app. Follow the steps below to get it running on your computer so you can make changes. If anything looks confusing, don't worry — Claude Code or Cursor can talk you through any step in plain English. Just paste the step into the chat and ask.

## What you need installed first

Before you can run the app, your computer needs three things installed. If you already have them, skip to the next section.

1. **Node.js** — this is the engine that runs the app on your computer. Go to https://nodejs.org and click the big button that says "LTS" (which stands for Long Term Support — it just means the stable version). Download it and run the installer, clicking Next through everything. When it finishes, you're done.

2. **Claude Code or Cursor** — you said you've already got these, so you're sorted. Either one will work for editing and running the app.

3. **A terminal** — this is the black window where you type commands. On a Mac it's called "Terminal" (search for it with Cmd + Space). On Windows it's called "PowerShell" or "Command Prompt". Cursor and Claude Code also have a terminal built in, which is usually easier — you'll see it at the bottom of the window.

## Step 1: Put the folder somewhere sensible

When you unzip the file I sent you, you'll get a folder called `merseyside-dairies-app`. Drag it somewhere you'll remember — your Documents folder is fine, or your Desktop. Just don't leave it in your Downloads folder, as things tend to get lost there.

## Step 2: Open the folder in Cursor or Claude Code

Open Cursor (or Claude Code), then go to **File > Open Folder** and choose the `merseyside-dairies-app` folder you just unzipped. You should see a list of files down the left-hand side.

## Step 3: Create your environment file

The app needs to know how to talk to your Supabase database. It reads this from a hidden file called `.env.local` which I've left out of the zip for security reasons. You'll need to create it yourself — it only takes a minute.

1. In Cursor/Claude Code, right-click in the file list on the left and choose **New File**.
2. Name it exactly `.env.local` (including the dot at the start — that's important).
3. Open https://supabase.com in your browser and log into your account (jishey@gmail.com).
4. Click on the **MerseysideDairies** project.
5. In the left sidebar click the gear icon (Settings), then click **API**.
6. You'll see two things you need to copy:
   - **Project URL** (looks like `https://lngshsqdnszrpkzzosdz.supabase.co`)
   - **anon public** key (a very long string of letters and numbers)
7. Paste them into your new `.env.local` file like this, replacing the bits in capitals with the actual values you just copied:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

8. Save the file (Cmd+S on Mac, Ctrl+S on Windows).

## Step 4: Install the app's dependencies

This is the step where the computer downloads all the behind-the-scenes code the app needs to run. It's the thing I deliberately didn't put in the zip because it's huge and gets rebuilt automatically.

1. Open the terminal inside Cursor/Claude Code (usually **View > Terminal** or press Ctrl + ` — that's the backtick key, top-left of your keyboard under Escape).
2. Type this and press Enter:

```
npm install
```

3. Wait. It'll print lots of text and take a minute or two. When it finishes and you get your prompt back, you're done. If you see a few yellow warnings, that's normal — ignore them. Only red errors matter.

## Step 5: Start the app

In the same terminal, type:

```
npm run dev
```

Wait a few seconds. You should see a message that ends with something like:

```
- Local: http://localhost:3000
```

Open that link in your browser (Cmd+click or Ctrl+click on it, or copy-paste into Chrome). You should see the welcome screen with the list of milkmen. If you do — congratulations, the app is running on your computer.

To stop the app later, go back to the terminal and press **Ctrl + C**.

## Making changes

Now the fun bit. With the app running, you can ask Claude Code or Cursor to make changes — just describe what you want in plain English in the chat window. Examples:

- "Change the welcome screen heading to say Good Morning Team"
- "Add a new milkman called Dave with PIN 1234"
- "Make the confirm button red instead of blue"

When you save a change, the app in your browser will update automatically within a second or two. No need to stop and restart it.

## Important files to know about

- **`src/`** — this is where all the actual app code lives. If you're making changes, this is where they go.
- **`CLAUDE.md`** — instructions for the AI. It tells Claude Code how to work on this project. Leave it alone unless you want to change the rules.
- **`merseyside-dairies-app.jsx`** — the original prototype. Don't edit this, but it's useful to look at when you want to see what the app should look like.
- **`.env.local`** — your Supabase keys. Never share this file with anyone.

## If something goes wrong

The best thing you can do is copy the error message, paste it into the Claude Code or Cursor chat, and ask "what does this mean and how do I fix it?". It'll explain in plain English and usually walk you through the fix.

A few common ones:

- **"command not found: npm"** — Node.js isn't installed. Go back to Step 1.
- **"Error: Cannot find module..."** — you probably forgot `npm install`. Run it again.
- **Welcome screen loads but shows no milkmen** — your `.env.local` file is wrong. Double-check the URL and key you copied from Supabase.
- **Port 3000 already in use** — the app is already running somewhere. Close any other terminal windows running it, or restart your computer.

## Deploying changes to the real website

Once you've made changes and you're happy with them, they need to be pushed to the live website (clipboard.merseysidedairies.co.uk). Don't do this yet — give me a shout and I'll walk you through it the first time. It involves a service called Vercel which we're already set up on.

## When in doubt

Ask Claude Code or Cursor. That's literally what they're there for. Describe what you're trying to do, what you see on your screen, and what's gone wrong. They're very good at explaining things simply when you tell them you're not a developer.

Any problems you can't figure out, give me a call.

— Luke
