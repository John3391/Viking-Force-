with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                                            <span className="text-viking-silver/70 block mt-1.5">
                                              Relógio simulado em{" "}
                                              <strong className="text-white font-bold">
                                                {currentTime}
                                              </strong>
                                              . Você tem até às{" "}
                                              <strong className="text-viking-gold font-bold">

                        {/* Core Workout Prescribed Preview */}"""

replacement = """                                            <span className="text-viking-silver/70 block mt-1.5">
                                              Você tem até às{" "}
                                              <strong className="text-viking-gold font-bold">
                                                {preferredTime}
                                              </strong>{" "}
                                              para treinar e registrar seu esforço sem soar o berrante de alerta.
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Core Workout Prescribed Preview */}"""

if target in content:
    with open('src/App.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed!")
else:
    print("Target not found.")
