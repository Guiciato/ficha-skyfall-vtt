// --- ESTADO DA APLICAÇÃO ---
let jogadores = JSON.parse(localStorage.getItem('fichas_v1')) || [];
let cemiterio = JSON.parse(localStorage.getItem('memorial_v1')) || [];
let fichaAtivaId = null;

// --- GERENCIAMENTO DE TELAS ---
const telas = ['tela-selecao', 'tela-criacao', 'tela-dashboard', 'tela-memorial'];

function mudarTela(telaId) {
    telas.forEach(id => {
        document.getElementById(id).classList.add('escondido');
    });
    document.getElementById(telaId).classList.remove('escondido');
    
    // Atualiza o conteúdo dependendo da tela acessada
    if (telaId === 'tela-selecao') renderizarSelecao();
    if (telaId === 'tela-memorial') renderizarMemorial();
    if (telaId === 'tela-dashboard') renderizarDashboard();
}

// --- 1. TELA DE SELEÇÃO ---
function renderizarSelecao() {
    const listaFichas = document.getElementById('lista-fichas');
    
    // Mantém o botão de "Nova Ficha" e adiciona as fichas existentes
    let html = '';
    jogadores.forEach(j => {
        html += `
        <div class="relative group w-40 h-56 bg-[#0f172a]/80 border border-white/5 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition-all">
            <div onclick="abrirDashboard(${j.id})" class="w-full h-full flex flex-col items-center justify-center">
                <h3 class="font-black uppercase text-xs tracking-widest text-slate-300 group-hover:text-amber-500">${j.nome}</h3>
                <p class="text-[8px] text-slate-500 uppercase mt-1">${j.classe}</p>
            </div>
            
            <div class="absolute -top-3 -right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-50">
                <button onclick="enviarParaMemorial(${j.id})" title="Enviar ao Memorial" class="bg-red-950 border border-red-500/50 text-red-500 p-2 rounded-full text-xs hover:bg-red-500 hover:text-white">💀</button>
                <button onclick="excluirFicha(${j.id})" title="Excluir Definitivamente" class="bg-slate-900 border border-slate-600 text-slate-400 p-2 rounded-full text-xs hover:bg-white hover:text-black">🗑️</button>
            </div>
        </div>
        `;
    });
    
    // Anexa o botão de Nova Ficha ao final
    html += `
        <div onclick="abrirCriacao()" class="w-40 h-56 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700 hover:text-amber-500 hover:border-amber-500 cursor-pointer transition-all">
            <span class="text-4xl mb-2">+</span>
            <p class="text-[10px] font-black uppercase tracking-widest">Nova Ficha</p>
        </div>
    `;
    
    listaFichas.innerHTML = html;
}

// Ações da Seleção
function excluirFicha(id) {
    if (confirm("Tem certeza que deseja excluir esta ficha permanentemente?")) {
        jogadores = jogadores.filter(j => j.id !== id);
        salvarDados();
        renderizarSelecao();
    }
}

function enviarParaMemorial(id) {
    const ficha = jogadores.find(j => j.id === id);
    if (ficha) {
        cemiterio.push(ficha);
        jogadores = jogadores.filter(j => j.id !== id);
        salvarDados();
        renderizarSelecao();
    }
}

// --- 2. TELA DE CRIAÇÃO / EDIÇÃO ---
function abrirCriacao(id = null) {
    const form = document.getElementById('form-ficha');
    const titulo = document.getElementById('titulo-form');
    
    form.reset();
    document.getElementById('ficha-id').value = '';

    if (id) {
        titulo.innerText = "Editar Ficha";
        const ficha = jogadores.find(j => j.id === id);
        if (ficha) {
            document.getElementById('ficha-id').value = ficha.id;
            document.getElementById('ficha-nome').value = ficha.nome;
            document.getElementById('ficha-classe').value = ficha.classe;
            document.getElementById('ficha-historia').value = ficha.historia || '';
        }
    } else {
        titulo.innerText = "Nova Ficha";
        // Aqui você pode ler o select de sistema para gerar os inputs certos
    }
    
    mudarTela('tela-criacao');
}

document.getElementById('form-ficha').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const idAbaixo = document.getElementById('ficha-id').value;
    const novaFicha = {
        id: idAbaixo ? parseInt(idAbaixo) : Date.now(),
        nome: document.getElementById('ficha-nome').value,
        classe: document.getElementById('ficha-classe').value,
        historia: document.getElementById('ficha-historia').value
    };

    if (idAbaixo) {
        // Editando
        const index = jogadores.findIndex(j => j.id === novaFicha.id);
        jogadores[index] = novaFicha;
    } else {
        // Criando
        jogadores.push(novaFicha);
    }

    salvarDados();
    mudarTela('tela-selecao');
});

// --- 3. DASHBOARD ---
function abrirDashboard(id) {
    fichaAtivaId = id;
    mudarTela('tela-dashboard');
}

function renderizarDashboard() {
    const ficha = jogadores.find(j => j.id === fichaAtivaId);
    if (!ficha) return mudarTela('tela-selecao');

    document.getElementById('dashboard-info').innerHTML = `
        <h1 class="text-6xl font-serif font-black text-amber-500 uppercase tracking-tighter italic">${ficha.nome}</h1>
        <p class="text-amber-500/80 font-bold uppercase tracking-[0.4em] mt-2 text-[10px]">${ficha.classe}</p>
        <p class="text-slate-400 mt-6 max-w-lg mx-auto">${ficha.historia}</p>
    `;
}

function editarFichaAtiva() {
    abrirCriacao(fichaAtivaId);
}

// --- 4. MEMORIAL ---
function renderizarMemorial() {
    const listaCemiterio = document.getElementById('lista-cemiterio');
    
    if (cemiterio.length === 0) {
        listaCemiterio.innerHTML = '<p class="text-slate-500 col-span-full text-center">Nenhum herói tombado.</p>';
        return;
    }

    let html = '';
    cemiterio.forEach(h => {
        html += `
        <div class="bg-zinc-950 p-6 rounded-[2rem] border border-red-900/20 flex flex-col items-center group relative overflow-hidden">
            <h3 class="font-black text-red-900 uppercase text-center text-sm mb-4">${h.nome}</h3>
            
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all absolute bottom-4">
                <button onclick="reviverFicha(${h.id})" class="bg-red-950 border border-red-900 text-[9px] font-black text-red-500 uppercase px-4 py-2 rounded hover:bg-red-900 hover:text-white">Reviver</button>
                <button onclick="excluirDoMemorial(${h.id})" class="bg-slate-900 border border-slate-700 text-[9px] font-black text-slate-500 uppercase px-4 py-2 rounded hover:bg-white hover:text-black">Apagar</button>
            </div>
        </div>
        `;
    });
    
    listaCemiterio.innerHTML = html;
}

function reviverFicha(id) {
    const ficha = cemiterio.find(h => h.id === id);
    if (ficha) {
        jogadores.push(ficha);
        cemiterio = cemiterio.filter(h => h.id !== id);
        salvarDados();
        renderizarMemorial();
    }
}

function excluirDoMemorial(id) {
    if (confirm("Esta ação apagará a ficha para sempre. Confirmar?")) {
        cemiterio = cemiterio.filter(h => h.id !== id);
        salvarDados();
        renderizarMemorial();
    }
}

// --- UTILITÁRIOS ---
function salvarDados() {
    localStorage.setItem('fichas_v1', JSON.stringify(jogadores));
    localStorage.setItem('memorial_v1', JSON.stringify(cemiterio));
}

// Iniciar a aplicação na tela de seleção
window.onload = () => renderizarSelecao();
