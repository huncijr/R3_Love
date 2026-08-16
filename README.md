<p>
  <img src="Frontend/public/Images/R3_Love.png" alt="R3 Love" width="40" align="left" />&nbsp; Real Love
</p>

## Real Love

Real Love (R_3_Love) is a web app where you can keep a log of events involving your partner or easily search for gifts for your partner. You can also set reminders for specific days so you won't forget anything important.

## 🎬 Live Demo

🚀 [Visit the website](https://reallove.dev)

![R3 Love Demo](Videos/R3_Demo.gif)

## Who was it made for?

For people who don't want to forget any special moments with their partner and who tend to leave important events to the last minute.

## Features

- Track birthdays, anniversaries, Valentine's, Girlfriend Day
- Answer questions about your partner and we recommend personalized gift ideas with store links & maps
- The app counts live how many days you've been together
- Get interesting information about your partner

## Run it locally

You need a `.env` file in the project root with your following keys: the database URL, Google OAuth, Resend, and the maps API key.

```bash
git clone https://github.com/huncijr/R_Love.git
cd R_Love
docker compose up --build
```

The frontend will be on `localhost:8080`, the backend will be `localhost:4000`.

If you'd rather run it without Docker, install the dependencies in both the `backend` and `frontend` folders, keep the same `.env`, then start the dev servers:

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm start
```
