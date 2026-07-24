with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser?.email && activeStudentProfile) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Escolha uma imagem de até 2MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const updatedProfile = {
            ...activeStudentProfile,
            photoUrl: result,
          };
          saveStudentsToDB({
            ...studentsData,
            [currentUser.email.toLowerCase()]: updatedProfile,
          });
          showToast("Sua foto de perfil foi atualizada!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };"""

replacement = """  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser?.email && activeStudentProfile) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Escolha uma imagem de até 5MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 150;
            const MAX_HEIGHT = 150;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            
            const updatedProfile = {
              ...activeStudentProfile,
              photoUrl: dataUrl,
            };
            const studentEmail = currentUser.email.toLowerCase();
            const updatedStudents = {
              ...studentsData,
              [studentEmail]: updatedProfile,
            };
            setStudentsData(updatedStudents);
            saveStudentsToDB(updatedStudents);
            saveStudentToFirebase(studentEmail, updatedProfile).catch(err => console.error(err));
            showToast("Sua foto de perfil foi atualizada!", "success");
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found.")
