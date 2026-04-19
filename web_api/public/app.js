// ==========================================
// web_api/public/app.js (Front-end Público)
// ==========================================

const loginForm = document.getElementById('login-form');
const listaEmentas = document.getElementById('lista-ementas');

// 1. Fazer Login e Redirecionar para o Back-Office
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok && data.token) {
                // Sucesso! Guardar a "pulseira VIP" no browser
                localStorage.setItem('aaualg_token', data.token);
                // Redirecionar imediatamente para a nova Fortaleza (Back-Office)
                window.location.href = '/admin.html';
            } else {
                alert(data.error || 'Credenciais inválidas.');
            }
        } catch (err) {
            console.error('Erro de login:', err);
            alert('Erro de comunicação com o servidor ao tentar fazer login.');
        }
    });
}

// 2. Carregar e Renderizar as Ementas Públicas (Modo Acordeão)
async function carregarEmentas() {
    try {
        const res = await fetch('/api/ementas');
        const data = await res.json();
        
        if (data.length === 0) {
            listaEmentas.innerHTML = '<p>Ainda não há ementas publicadas para esta semana.</p>';
            return;
        }

        // Agrupar os pratos por Dia da Semana
        const ementasPorDia = {};
        data.forEach(row => {
            if (!ementasPorDia[row.dia_semana]) {
                // Formatar a data (ex: 2026-04-13 -> 13/04/2026)
                const dataFormatada = new Date(row.data).toLocaleDateString('pt-PT');
                ementasPorDia[row.dia_semana] = { data: dataFormatada, pratos: [] };
            }
            if (row.nome) {
                ementasPorDia[row.dia_semana].pratos.push(row);
            }
        });

        // Gerar o HTML Expansível (Accordion)
        let html = '';
        for (const [dia, info] of Object.entries(ementasPorDia)) {
            html += `
                <details>
                    <summary>${dia} - ${info.data}</summary>
                    <div class="pratos-container">
                        ${info.pratos.map(p => `
                            <div class="prato-card">
                                <div class="prato-header">
                                    <span class="prato-nome">${p.nome}</span>
                                    <span class="badge ${p.tipo}">${p.tipo}</span>
                                </div>
                                <p class="prato-desc">${p.descricao || 'Sem descrição.'}</p>
                                <div class="alergenos">
                                    <strong>Alérgenos:</strong> ${p.alergenos ? p.alergenos : 'Nenhum reportado'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </details>
            `;
        }
        
        listaEmentas.innerHTML = html;
    } catch (err) {
        console.error('Erro ao carregar as ementas:', err);
        listaEmentas.innerHTML = '<p>Erro ao carregar as ementas. Tente novamente mais tarde.</p>';
    }
}

// 3. Inicializar a página carregando as ementas
carregarEmentas();