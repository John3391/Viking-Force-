with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """    const updatedProfile: StudentProfile = {
      ...activeStudentProfile,
      sessions: [newSession, ...(activeStudentProfile.sessions || [])],
    };

    // Auto-save completed session & student feedback immediately to DB & Firebase
    const studentEmail = (
      activeStudentProfile.email ||
      currentUser?.email ||
      ""
    )
      .toLowerCase()
      .trim();

    if (studentEmail) {
      const updatedStudents = {
        ...studentsData,
        [studentEmail]: updatedProfile,
      };
      setStudentsData(updatedStudents);
      saveStudentsToDB(updatedStudents);
      saveStudentToFirebase(studentEmail, updatedProfile).catch((err) =>
        console.error("Erro no salvamento automático do treino no Firebase:", err)
      );
    }

    setPendingSession(newSession);
    setConfirmSessionModalOpen(true);

    // Check for Wilks goal achievement
    const oldTotal =
      (activeStudentProfile.prs?.squat || 0) +
      (activeStudentProfile.prs?.bench || 0) +
      (activeStudentProfile.prs?.deadlift || 0);
    const oldWilks = calculateWilks(
      activeStudentProfile.gender || "male",
      activeStudentProfile.bodyWeight || 0,
      oldTotal,
    );
    const getTierIdx = (w: number) => {
      let idx = 0;
      for (let i = WILKS_LEVELS.length - 1; i >= 0; i--) {
        if (w >= WILKS_LEVELS[i].minWilks) {
          idx = i;
          break;
        }
      }
      return idx;
    };
    const oldTierIdx = getTierIdx(oldWilks);

    const newTotal =
      (updatedProfile.prs?.squat || 0) +
      (updatedProfile.prs?.bench || 0) +
      (updatedProfile.prs?.deadlift || 0);

    const newWilks = calculateWilks(
      updatedProfile.gender || "male",
      updatedProfile.bodyWeight || 0,
      newTotal,
    );
    const newTierIdx = getTierIdx(newWilks);
    if (newTierIdx > oldTierIdx) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#d4af37", "#e0d3a8", "#ffffff"],
      });
      showToast(
        `🏆 Parabéns! Você atingiu a meta Wilks: ${WILKS_LEVELS[newTierIdx].name}!`,
        "success",
      );
    }

    setWorkoutModalOpen(false);
    setSessionRpeState({});
    setExerciseFailureState({});
    setExerciseSetsState({});
    setExerciseWarmupState({});
    setRestTimerActive(false);
    setSessionNote("");

    // Smooth scroll to top of screen
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);"""

replacement = """    setPendingSession(newSession);
    setConfirmSessionModalOpen(true);"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed!")
else:
    print("Target not found.")
