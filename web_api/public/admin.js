const jwtToken = localStorage.getItem('aaualg_token');

// Bloqueio quando não há token JWT válido
if (!jwtToken) {
    window.location.href = '/';
}

document.getElementById('tab-pratos').addEventListener('click', (e) => trocarAba(e, 'panel-pratos'));
document.getElementById('tab-ementas').addEventListener('click', (e) => trocarAba(e, 'panel-ementas'));

// Tabs
function trocarAba(evento, panelId) {
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    evento.target.classList.add('active');
    document.getElementById(panelId).classList.add('active');
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('aaualg_token');
    window.location.href = '/';
});

let pratosCatalogo = [];

// Carregar os Pratos da Base de Dados
async function carregarPratosAdmin() {
    try {
        const res = await fetch('/api/pratos', {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        if (res.status === 401 || res.status === 403) throw new Error("Acesso Negado");
        pratosCatalogo = await res.json();
        
        // Renderizar a lista COM botões de Editar e Eliminar
        const listaHtml = pratosCatalogo.map(p => `
            <li style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${p.nome}</strong> <span class="badge ${p.tipo}">${p.tipo}</span>
                    <div style="font-size: 0.8rem; color: #666; margin-top: 3px;">${p.descricao || 'Sem descrição'}</div>
                </div>
                <div>
                    <button onclick="prepararEdicao(${p.id})" style="background-color: #f0ad4e; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right: 5px;">Editar</button>
                    <button onclick="eliminarPrato(${p.id})" style="background-color: #d9534f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Eliminar</button>
                </div>
            </li>`).join('');
        document.getElementById('lista-todos-pratos').innerHTML = listaHtml;

        // checkboxes para criar ementas
        const gridHtml = pratosCatalogo.map(p => `
            <label class="prato-check">
                <input type="checkbox" name="pratos_selecionados" value="${p.id}">
                ${p.nome} (${p.tipo})
            </label>`).join('');
        document.getElementById('grid-selecao-pratos').innerHTML = gridHtml;

    } catch (err) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = '/';
    }
}

// Preparar Formulário para Edição
window.prepararEdicao = function(id) {
    const prato = pratosCatalogo.find(p => p.id === id);
    if (!prato) return;

    // Preencher o formulário
    document.getElementById('prato-id').value = prato.id;
    document.getElementById('prato-nome').value = prato.nome;
    document.getElementById('prato-desc').value = prato.descricao || '';
    document.getElementById('prato-tipo').value = prato.tipo;

    // Alterar o aspeto do formulário
    document.getElementById('form-prato-titulo').innerText = 'Editar Prato';
    document.getElementById('btn-guardar-prato').innerText = 'Atualizar Prato';
    document.getElementById('btn-cancelar-edicao').style.display = 'inline-block';
    
    // Rolar a página para cima
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancelar Edição
document.getElementById('btn-cancelar-edicao').addEventListener('click', () => {
    document.getElementById('novo-prato-form').reset();
    document.getElementById('prato-id').value = '';
    document.getElementById('form-prato-titulo').innerText = 'Adicionar Novo Prato';
    document.getElementById('btn-guardar-prato').innerText = 'Guardar';
    document.getElementById('btn-cancelar-edicao').style.display = 'none';
});

// Salvar Prato
document.getElementById('novo-prato-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('prato-id').value;
    const payload = {
        nome: document.getElementById('prato-nome').value,
        descricao: document.getElementById('prato-desc').value,
        tipo: document.getElementById('prato-tipo').value
    };

    // Se tem ID, fazemos PUT (Update). Se não tem, fazemos POST (Create).
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/pratos/${id}` : '/api/pratos';

    const res = await fetch(url, {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert(id ? 'Prato atualizado com sucesso!' : 'Prato adicionado ao catálogo!');
        document.getElementById('btn-cancelar-edicao').click(); // Limpa e reseta o form
        carregarPratosAdmin(); // Recarrega as listas
    } else {
        alert('Erro ao guardar o prato.');
    }
});

// Eliminar Prato
window.eliminarPrato = async function(id) {
    if (!confirm('Tem a certeza que deseja eliminar este prato? Ele desaparecerá das ementas em que foi inserido.')) return;

    try {
        const res = await fetch(`/api/pratos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (res.ok) {
            alert('Prato eliminado com sucesso!');
            carregarPratosAdmin();
        } else {
            alert('Erro ao eliminar prato.');
        }
    } catch (err) {
        alert('Erro de comunicação com o servidor.');
    }
};

// Criar Ementa do Dia
document.getElementById('nova-ementa-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Recolher todos os IDs de pratos que foram assinalados na checkbox
    const checkboxes = document.querySelectorAll('input[name="pratos_selecionados"]:checked');
    const pratosIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    const payload = {
        data: document.getElementById('ementa-data').value,
        dia_semana: document.getElementById('ementa-dia').value,
        pratos_ids: pratosIds
    };

    const res = await fetch('/api/ementas', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(payload)
    });

    const dataRes = await res.json();
    if (res.ok) {
        alert('Ementa publicada com sucesso! Os alunos já a podem ver na página principal.');
        e.target.reset();
    } else {
        alert(dataRes.error || 'Erro ao publicar ementa.');
    }
});

// Arrancar a página
carregarPratosAdmin();