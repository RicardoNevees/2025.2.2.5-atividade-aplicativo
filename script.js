let db;   // LET cria uma variável para armazenar a referência ao bando de dados. DB é o nome dado a esse espaço de armazenamento.
const request = indexedDB.open("ListaComprasDB", 1);   // CONST constante. REQUEST nome dado p/ a constante que guarda o pedido de abertura do bando de dados.

// 1. Configuração do Banco de Dados
request.onupgradeneeded = (event) => {   // ONUPGRADENEEDED ocorre quando o banco de dados é criado pela primera vez.
    db = event.target.result;   // a variável "db", criada no topo, recebe a referência ao banco de dados aberto
    db.createObjectStore("itens", { keyPath: "id", autoIncrement: true });   // comando para criar a "gaveta" (tabela) onde os itens serão guardados.
};

request.onsuccess = (event) => {     //ocorre sempre que você abre o site e o banco de dados é carregado com sucesso.
    db = event.target.result;
    renderizarLista(); 
};

// 2. Funções de Gerenciamento (CRUD).    Aqui, veremos comandos que convesam com a página HTML
function adicionarItem() {   
    const input = document.getElementById("itemInput");    // DOCUMENT representa toa a página HTML. GETELEMENTBYID diz: "Encontre o elemento com o ID 'itemInput' e me traga ele".
    const nome = input.value.trim(); // .trim() remove espaços vazios inúteis

    if (nome === "") return; // Não adiciona se estiver vazio

    const transaction = db.transaction(["itens"], "readwrite");
    const store = transaction.objectStore("itens");
    store.add({ nome: nome });

    transaction.oncomplete = () => {
        input.value = ""; // Limpa o campo após adicionar
        renderizarLista();
    };
}

function renderizarLista() {   // essa função é responsável por DESENHAR a lista de itens na tela. Sem ela, os dados estariam guardados no banco, mas o usuário não veria nada.
    const listElement = document.getElementById("shoppingList");
    
    // Criamos o cabeçalho das colunas apenas se houver itens.  
    // .innerHTML commando que permite o JavaScript escrever código HTML dentro de um elemento existente na página
    listElement.innerHTML = `
        <li class="header-list">
            <span class="col-item">ITEM</span>
            <span class="col-desc">DESCRIÇÃO</span>
            <span class="col-action"></span>
        </li>
    `;

    const transaction = db.transaction(["itens"], "readonly");  // No JS, para mexer no banco de dados, precisamos de uma licença de uso: READWRITE (Ler e Escrever) ou READONLY (Apenas Ler).
    const store = transaction.objectStore("itens");   // CONST STORE cria uma constante STORE para guardar o acesso à tabela de dados. OBJECTSTORE abre uma gaveta específica.
    const request = store.getAll();  // guarda tudo o que tem na tabela "itens" dentro da constante REQUEST. O comando GETALL é o que diz: "Me traga tudo o que tem aqui dentro".

    request.onsuccess = () => {
        const itens = request.result;
        
        // Se não houver itens, limpamos o cabeçalho
        if (itens.length === 0) {
            listElement.innerHTML = "<p style='text-align:center; color:#888;'>Sua lista está vazia</p>";
            return;
        }

        itens.forEach((item, index) => {   // itens.forEach é um laço de repetição. O forEach vai repetir o comando de criar a linha 10 vezes, uma para cada item.
            const li = document.createElement("li");
            li.className = "item-row"; // Classe para estilizar a linha
            li.innerHTML = `
                <span class="col-item">${index + 1}</span>
                <span class="col-desc">${item.nome}</span>
                <span class="col-action">
                    <span class="delete-btn" onclick="removerItem(${item.id})" title="Remover">X</span>
                </span>
            `;
            listElement.appendChild(li);
        });
    };
}

function removerItem(id) {
    const transaction = db.transaction(["itens"], "readwrite");
    const store = transaction.objectStore("itens");
    store.delete(id);
    transaction.oncomplete = renderizarLista;
}

// 3. OUVINTES DE EVENTOS
// Clique no botão
document.getElementById("addButton").onclick = adicionarItem;  // o JS localiza o botão "addButton" e diz: "Quando alguém clicar aqui, execute a função adicionarItem()".

// Aperto da tecla Enter
// ADDEVENTLISTENER diz ao campo de texto: "Fique de olho no que a pessoa digita aqui. Se ela apertar a tecla Enter, execute a função adicionarItem()". 
// O "keypress" é o tipo de evento que estamos ouvindo, ou seja, quando a pessoa pressiona uma tecla.
document.getElementById("itemInput").addEventListener("keypress", function (event) { 
    if (event.key === "Enter") {  // EVENT.KEY é a tecla que foi pressionada. Se for "Enter", então execute a função adicionarItem().
        adicionarItem();
    }
});