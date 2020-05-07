<script>
    let synonyms = []
    
    export let words

    $: if(words.length > 2) {
        fetch('https://api.datamuse.com/words?rel_rhy=' + words)
        .then( res => res.json() )
            .then( json => {
                console.log(json)
                synonyms = json
            })
    }

</script>

<section>
    
    {#each synonyms as synonym}
        <div>    
            <h5>{synonym.word}</h5>
        </div>
    {:else}
        <div>        
            <p>Please type a word or sentence in the input field</p>
        </div>
    {/each}
    
    
</section>

<style>
    section{
        display:grid;
        grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
        gap:1rem;
    }
    section > div {
        background-color: lightslategrey;
        display:grid;
        place-items:center;
        height:100%;
        font-size: 1.6rem;
        border-radius: 8px;
    }
</style>