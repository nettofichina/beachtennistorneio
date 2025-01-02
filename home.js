document.addEventListener('DOMContentLoaded', () => {
    // Navegação para outras páginas
    document.getElementById('informarDuplas').addEventListener('click', () => {
        window.location.href = 'duplas-manuais.html';
    });

    document.getElementById('sortearDuplas').addEventListener('click', () => {
        window.location.href = 'duplas-aleatorias.html';
    });

    // Funções para gerenciar campeonatos e ranking
    let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');

    const campeonatosDiv = document.getElementById('campeonatos');
    const verCampeonatosBtn = document.getElementById('verCampeonatosBtn');

    document.getElementById('verCampeonatosBtn').addEventListener('click', () => {
        if (verCampeonatosBtn.textContent === 'Ver Campeonatos') {
            verCampeonatosBtn.textContent = 'Ocultar Campeonatos';
            if (campeonatosDiv) {
                campeonatosDiv.innerHTML = '';

                campeonatos.forEach((campeonato, index) => {
                    const campeonatoDiv = document.createElement('div');
                    campeonatoDiv.className = 'campeonato';

                    const titulo = document.createElement('h4');
                    titulo.textContent = campeonato.torneio;
                    campeonatoDiv.appendChild(titulo);

                    const dataSpan = document.createElement('p');
                    dataSpan.textContent = `Dia do Torneio: ${campeonato.data}`;
                    campeonatoDiv.appendChild(dataSpan);

                    const toggleResultadosBtn = document.createElement('button');
                    toggleResultadosBtn.textContent = 'Ver Resultados';
                    toggleResultadosBtn.className = 'toggle-resultados';
                    campeonatoDiv.appendChild(toggleResultadosBtn);

                    const resultadosContainer = document.createElement('div');
                    resultadosContainer.className = 'resultados-container';
                    resultadosContainer.style.display = 'none';
                    campeonatoDiv.appendChild(resultadosContainer);

                    toggleResultadosBtn.addEventListener('click', () => {
                        if (resultadosContainer.style.display === 'none') {
                            resultadosContainer.style.display = 'block';
                            toggleResultadosBtn.textContent = 'Ocultar Resultados';
                        } else {
                            resultadosContainer.style.display = 'none';
                            toggleResultadosBtn.textContent = 'Ver Resultados';
                        }
                        
                        resultadosContainer.innerHTML = '';
                        campeonato.jogos.forEach((jogo) => {
                            const jogoDiv = document.createElement('div');
                            jogoDiv.className = 'jogo-resultado';
                            
                            let resultadoTexto = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;
                            if (jogo.placar) {
                                resultadoTexto += ` - Placar: ${jogo.placar}`;
                                const [set1, set2] = jogo.placar.split('-').map(Number);
                                const vencedor = set1 > set2 ? jogo.dupla1 : (set2 > set1 ? jogo.dupla2 : 'Empate');
                                resultadoTexto += ` (Vencedor: ${vencedor.join(' e ')})`;
                            } else {
                                resultadoTexto += ' - Sem placar registrado';
                            }
                            jogoDiv.textContent = resultadoTexto;
                            resultadosContainer.appendChild(jogoDiv);
                        });
                    });

                    campeonatoDiv.addEventListener('dblclick', (e) => {
                        if (confirm('Tem certeza que deseja remover este campeonato?')) {
                            campeonatos.splice(index, 1);
                            localStorage.setItem('campeonatos', JSON.stringify(campeonatos));
                            verCampeonatosBtn.click(); // Atualiza a lista após remover
                        }
                    });

                    campeonatosDiv.appendChild(campeonatoDiv);
                });
            } else {
                console.error('Elemento com ID "campeonatos" não encontrado');
            }
        } else {
            verCampeonatosBtn.textContent = 'Ver Campeonatos';
            if (campeonatosDiv) {
                campeonatosDiv.innerHTML = '';  // Limpa a lista de campeonatos
            }
        }
    });

    document.getElementById('rankingBtn').addEventListener('click', () => {
        const dataInicio = document.getElementById('dataInicio')?.value;
        const dataFim = document.getElementById('dataFim')?.value;
        const rankingDiv = document.getElementById('ranking');
        if (rankingDiv) {
            let ranking = {};
    
            if (!dataInicio || !dataFim) {
                alert('Por favor, selecione um intervalo de datas para gerar o ranking.');
                return;
            }
    
            campeonatos.filter(campeonato => {
                const dataCampeonato = new Date(campeonato.data);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataCampeonato >= inicio && dataCampeonato <= fim;
            }).forEach((campeonato) => {
                campeonato.jogos.forEach((jogo) => {
                    const { dupla1, dupla2, placar } = jogo;
    
                    if (placar) {
                        const [set1, set2] = placar.split('-').map(Number);
                        const pontos = set1 - set2;
    
                        [...dupla1, ...dupla2].forEach((jogador) => {
                            const nomeNormalizado = jogador.toUpperCase().trim();
                            ranking[nomeNormalizado] = ranking[nomeNormalizado] || { pontos: 0, jogos: 0 };
                            ranking[nomeNormalizado].pontos += (dupla1.includes(jogador) ? pontos : -pontos);
                            ranking[nomeNormalizado].jogos++;
                        });
                    }
                });
            });
    
            const rankingArray = Object.entries(ranking).sort((a, b) => b[1].pontos - a[1].pontos);
    
            rankingDiv.innerHTML = '<h3>Ranking</h3>';
            rankingArray.forEach(([jogador, { pontos, jogos }], index) => {
                const rankItem = document.createElement('div');
                let medalha = '';
                if (index === 0) {
                    medalha = '🥇';
                } else if (index === 1) {
                    medalha = '🥈';
                } else if (index === 2) {
                    medalha = '🥉';
                }
                
                rankItem.innerHTML = `
                    <span class="position">${index + 1}.</span> 
                    ${medalha} ${jogador}: ${pontos} pontos 
                    <span class="jogos-info">(${jogos} jogos)</span>
                `;
                rankItem.setAttribute('aria-label', `${jogador} tem ${pontos} pontos e ${jogos} jogos e está na posição ${index + 1}.`);
                rankingDiv.appendChild(rankItem);
            });
        } else {
            console.error('Elemento com ID "ranking" não encontrado');
        }
    });
    
    // Função para exportar dados
    document.getElementById('exportarDados').addEventListener('click', exportarDados);
    document.getElementById('exportarDados').addEventListener('touchstart', exportarDados);

    // Função para importar dados
    document.getElementById('importarDados').addEventListener('click', importarDados);
    document.getElementById('importarDados').addEventListener('touchstart', importarDados);

    function exportarDados(e) {
        e.preventDefault();
        const dados = {
            campeonatos: campeonatos
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "dados_beach_tennis.json");
        downloadAnchorNode.setAttribute("target", "_blank"); 
        document.body.appendChild(downloadAnchorNode); 
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function importarDados(e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const dadosImportados = JSON.parse(event.target.result);
                    if (dadosImportados.campeonatos) {
                        localStorage.setItem('campeonatos', JSON.stringify(dadosImportados.campeonatos));
                        campeonatos = dadosImportados.campeonatos;
                        alert('Dados importados com sucesso! A base de dados foi atualizada.');
                    } else {
                        alert('Arquivo inválido ou dados corrompidos.');
                    }
                } catch (error) {
                    alert('Erro ao importar dados: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
});