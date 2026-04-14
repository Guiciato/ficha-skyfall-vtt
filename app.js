// --- DENTRO DA TELA DE CRIAÇÃO / EDIÇÃO ---
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
            
            // Carregando atributos salvos
            if(ficha.atributos) {
                document.getElementById('attr-for').value = ficha.atributos.for || 0;
                document.getElementById('attr-des').value = ficha.atributos.des || 0;
                document.getElementById('attr-con').value = ficha.atributos.con || 0;
                document.getElementById('attr-int').value = ficha.atributos.int || 0;
                document.getElementById('attr-sab').value = ficha.atributos.sab || 0;
                document.getElementById('attr-car').value = ficha.atributos.car || 0;
            }
        }
    } else {
        titulo.innerText = "Nova Ficha";
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
        historia: document.getElementById('ficha-historia').value,
        // Salvando os atributos
        atributos: {
            for: document.getElementById('attr-for').value,
            des: document.getElementById('attr-des').value,
            con: document.getElementById('attr-con').value,
            int: document.getElementById('attr-int').value,
            sab: document.getElementById('attr-sab').value,
            car: document.getElementById('attr-car').value
        }
    };

    if (idAbaixo) {
        const index = jogadores.findIndex(j => j.id === novaFicha.id);
        jogadores[index] = novaFicha;
    } else {
        jogadores.push(novaFicha);
    }

    salvarDados();
    mudarTela('tela-selecao');
});

// --- DENTRO DO DASHBOARD ---
function renderizarDashboard() {
    const ficha = jogadores.find(j => j.id === fichaAtivaId);
    if (!ficha) return mudarTela('tela-selecao');

    // Garantir que não quebre se for uma ficha antiga sem atributos
    const attr = ficha.atributos || { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 };

    document.getElementById('dashboard-info').innerHTML = `
        <h1 class="text-7xl font-serif font-black text-amber-500 uppercase tracking-tighter italic drop-shadow-2xl">${ficha.nome}</h1>
        <p class="text-amber-500/80 font-bold uppercase tracking-[0.4em] mt-2 text-xs drop-shadow-md">${ficha.classe}</p>
        
        <div class="flex justify-center gap-4 mt-12 mb-8">
            ${Object.entries(attr).map(([chave, valor]) => `
                <div class="w-16 h-16 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">${chave}</span>
                    <span class="text-xl font-serif font-black text-white">${valor >= 0 ? '+' + valor : valor}</span>
                </div>
            `).join('')}
        </div>

        <div class="bg-black/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl max-w-2xl mx-auto">
            <p class="text-slate-300 leading-relaxed text-sm">${ficha.historia || 'Nenhuma história registrada.'}</p>
        </div>
    `;
}
