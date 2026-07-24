with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                          e agora já são{" "}
                                          <strong className="text-red-300 font-black">
                                            {simulatedTime}
                                          </strong>
                                          !
                                        </p>
                                        <p className="text-[11px] text-red-200/85 mt-1 italic font-medium">
                                          "Nenhum guerreiro adentra os salões de
                                          Valhalla de braços cruzados. Erga o
                                          aço!"
                                        </p>
                                      </div>
                                    </div>
                                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                      <button
                                        onClick={() =>
                                          setWorkoutModalOpen(true)
                                        }
                                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 text-center cursor-pointer"
                                      >
                                        🏋️ Iniciar Treino de Hoje
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSimulatedTime("08:00");
                                          showToast(
                                            "Alerta silenciado (relógio ajustado para 08:00)",
                                            "info",
                                          );
                                        }}
                                        className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/40 border border-red-500/20 hover:border-red-500/40 text-red-300 font-bold text-xs uppercase transition-all text-center cursor-pointer"
                                      >
                                        Silenciar
                                      </button>
                                    </div>"""

replacement = """                                          e agora já são{" "}
                                          <strong className="text-red-300 font-black">
                                            {currentTime}
                                          </strong>
                                          !
                                        </p>
                                        <p className="text-[11px] text-red-200/85 mt-1 italic font-medium">
                                          "Nenhum guerreiro adentra os salões de
                                          Valhalla de braços cruzados. Erga o
                                          aço!"
                                        </p>
                                      </div>
                                    </div>
                                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                      <button
                                        onClick={() =>
                                          setWorkoutModalOpen(true)
                                        }
                                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/20 text-center cursor-pointer"
                                      >
                                        🏋️ Iniciar Treino de Hoje
                                      </button>
                                    </div>"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed!")
else:
    print("Target not found.")
