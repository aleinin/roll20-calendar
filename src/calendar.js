/**
 *
 *
 * Data
 *
 *
 */

const initialData = {
  calendar: {
    daysOfWeek: [
      "Monsday",
      "Tymsday",
      "Groomsday",
      "Silvday",
      "Luthsday",
      "Atovsday",
      "Pelorsday",
    ],
    months: [
      {
        name: "Lathandry",
        days: 28,
      },
      {
        name: "Istishan",
        days: 28,
      },
      {
        name: "Temper",
        days: 28,
      },
      {
        name: "Asark",
        days: 28,
      },
      {
        name: "Malay",
        days: 28,
      },
      {
        name: "Lune",
        days: 28,
      },
      {
        name: "Gallus",
        days: 28,
      },
      {
        name: "Sextus",
        days: 28,
      },
      {
        name: "Sintilla",
        days: 28,
      },
      {
        name: "Mammanter",
        days: 28,
      },
      {
        name: "Oltime",
        days: 28,
      },
      {
        name: "Frosten",
        days: 28,
      },
      {
        name: "Jergaul",
        days: 28,
      },
    ],
    eras: [
      {
        name: "Age of Titans",
        startYear: 1,
      },
      {
        name: "Age of Flesh",
        startYear: 1000,
      },
      {
        name: "Age of Bondage",
        startYear: 3024,
      },
      {
        name: "Age of Discovery",
        startYear: 3659,
      },
    ],
    skipYearZero: true,
  },
  today: {
    dayOfWeek: 5,
    month: 2,
    day: 27,
    year: 3863,
  },
};

let data;
/**
 *
 *
 * Core Logic
 *
 *
 */

const currentDate = (today, calendar) => {
  const getYearDisplay = () => {
    const era = getEra(calendar.eras, today.year);
    if (era != null) {
      const eraYear = today.year - era.startYear + 1;
      if (eraYear > 0) {
        return `${eraYear} ${era.name} (year ${today.year})`;
      }
    }
    return `year ${today.year}`;
  };
  return `${getDayOfWeek(calendar.daysOfWeek, today.dayOfWeek)}, ${today.day} ${
    getMonth(calendar.months, today.month).name
  },\n ${getYearDisplay()}`;
};

const incrementDate = (readonlyToday, calendar) => {
  const today = { ...readonlyToday };
  const isLastDayOfMonth = (day, month) => day === month.days;
  const isLastMonthOfYear = (month) => month === calendar.months.length - 1;
  const currentMonth = getMonth(calendar.months, today.month);
  if (isLastDayOfMonth(today.day, currentMonth)) {
    if (isLastMonthOfYear(today.month)) {
      today.month = 0;
      today.year += 1;
      if (calendar.skipYearZero && today.year === 0) {
        today.year = 1;
      }
    } else {
      // not last month of year
      today.month += 1;
    }
    today.day = 1;
  } else {
    // not last day of month
    today.day += 1;
  }
  today.dayOfWeek = getNextDayOfWeek(calendar.daysOfWeek, today.dayOfWeek);
  return today;
};

const decrementDate = (readonlyToday, calendar) => {
  const today = { ...readonlyToday };
  const isFirstDayOfMonth = (day) => day === 1;
  const isFirstMonthOfYear = (currentMonth) => currentMonth === 0;
  if (isFirstDayOfMonth(today.day)) {
    if (isFirstMonthOfYear(today.month)) {
      today.month = calendar.months.length - 1;
      today.year -= 1;
      if (calendar.skipYearZero && today.year === 0) {
        today.year = -1; // skip year 0
      }
    } else {
      // not first month of year
      today.month -= 1;
    }
    today.day = getMonth(calendar.months, today.month).days;
  } else {
    // not first day of month
    today.day -= 1;
  }
  today.dayOfWeek = getPreviousDayOfWeek(calendar.daysOfWeek, today.dayOfWeek);
  return today;
};

const getNextDayOfWeek = (daysOfWeek, currentDayOfWeekIndex) => {
  return currentDayOfWeekIndex === daysOfWeek.length - 1
    ? 0
    : currentDayOfWeekIndex + 1;
};

const getPreviousDayOfWeek = (daysOfWeek, currentDayOfWeekIndex) => {
  return currentDayOfWeekIndex === 0
    ? daysOfWeek.length - 1
    : currentDayOfWeekIndex - 1;
};

const getMonth = (months, index) => {
  return months[index];
};

const getEra = (eras, year) => {
  if (eras == null || eras.length === 0) {
    return undefined;
  }
  return eras.reduce((topEra, era) =>
    era.startYear <= year && era.startYear > topEra.startYear ? era : topEra
  );
};

const getDayOfWeek = (daysOfWeek, index) => {
  return daysOfWeek[index];
};

/**
 *
 *
 * Roll 20 Logic
 *
 *
 */

on("ready", () => {
  if (!state.KhervenNS) {
    state.KhervenNS = initialData;
  }
  data = state.KhervenNS;
});

const asDescTemplate = (content) => {
  return `&{template:desc} {{desc=${content}}}`;
};

on("chat:message", (msg) => {
  if (playerIsGM(msg.playerid)) {
    if (msg.content.startsWith("!cal")) {
      const command = msg.content.replace(/!cal\s*/, "");
      const sendToday = () =>
        sendChat(
          "Calendar",
          asDescTemplate(currentDate(data.today, data.calendar))
        );
      switch (command) {
        case "":
          sendToday();
          break;
        case "next":
          const nextDay = incrementDate(data.today, data.calendar);
          data.today = nextDay;
          state.KhervenNS.today = nextDay;
          sendToday();
          break;
        case "previous":
          const previousDay = decrementDate(data.today, data.calendar);
          data.today = previousDay;
          state.KhervenNS.today = previousDay;
          sendToday();
          break;
      }
    }
  }
  return;
});
