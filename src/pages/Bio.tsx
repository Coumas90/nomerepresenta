import Header from "@/components/Header";

const Bio = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 sm:pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 animate-fade-in">BIO</h1>
          
          {/* Artist Info */}
          <div className="mb-12 sm:mb-16 animate-fade-in">
            <p className="text-lg sm:text-xl font-semibold mb-6">
              Ivan Comas (b. 1987, Buenos Aires)
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Ivan Comas is a Franco-Argentine artist working between São Paulo and Paris. His practice evolves through layered procedures that merge industrial materials, fragmented text, and the visual residue of dense urban environments. Comas builds stratified surfaces through cycles of inscription, burial, and rupture, developing a material language shaped by years of movement between major cities and long periods of photographic and observational research.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-4">
              Educated at the École des Beaux-Arts de Paris, Comas has developed a body of work that intersects painting, photography, and writing, forming a coherent investigation into memory, architecture, and the rhythm of collapsing structures. His work has been exhibited in Los Angeles, Berlin, Paris, and São Paulo, and is held in private collections in Latin America, Europe, and the United States, including the Jumex and Vergez & Pearson collections.
            </p>
          </div>

          {/* Education */}
          <section className="mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">EDUCATION</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2007-2012</div>
                <div>
                  <div className="font-medium">MFA</div>
                  <div className="text-muted-foreground">École Nationale Supérieure des Beaux Arts de Paris</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2011</div>
                <div>
                  <div className="font-medium">Exchange program</div>
                  <div className="text-muted-foreground">Cooper Union, New York</div>
                </div>
              </div>
            </div>
          </section>

          {/* Solo and Two Person Exhibitions */}
          <section className="mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">SOLO AND TWO PERSON EXHIBITIONS</h2>
            <div className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2024</div>
                <div>
                  <span className="font-medium">Metronomo</span>
                  <span className="text-muted-foreground">, Instituto Alto, São Paulo</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2019</div>
                <div>
                  <span className="font-medium">A hole in the wall</span>
                  <span className="text-muted-foreground">, Espacio Abierto, CDMX</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2016</div>
                <div>
                  <span className="font-medium">After Sonora</span>
                  <span className="text-muted-foreground">, Steve Turner, Los Angeles</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2015</div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Days go by</span>
                    <span className="text-muted-foreground">, Duve, Berlin</span>
                  </div>
                  <div>
                    <span className="font-medium">Art Berlin Contemporary, ABC</span>
                    <span className="text-muted-foreground"> (with Steve Turner), Berlin</span>
                  </div>
                  <div>
                    <span className="font-medium">Ivan Comas and Joaquín Boz, ArtBo</span>
                    <span className="text-muted-foreground">, Bogotá (with Steve Turner)</span>
                  </div>
                  <div>
                    <span className="font-medium">La Brea</span>
                    <span className="text-muted-foreground">, Steve Turner, Los Angeles</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2014</div>
                <div>
                  <span className="font-medium">Recent Works</span>
                  <span className="text-muted-foreground">, Vergez Collection, Buenos Aires</span>
                </div>
              </div>
            </div>
          </section>

          {/* Selected Group Exhibitions */}
          <section className="mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">SELECTED GROUP EXHIBITIONS</h2>
            <div className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2018</div>
                <div>
                  <span className="font-medium">Sun Kiss Choked</span>
                  <span className="text-muted-foreground">, Y53, Los Angeles</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2017</div>
                <div>
                  <span className="font-medium">Monet is my church</span>
                  <span className="text-muted-foreground">, Dittrich & Schlectriem, Berlin</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-6">
                <div className="font-semibold">2015</div>
                <div>
                  <span className="font-medium">UNTITLED</span>
                  <span className="text-muted-foreground"> (with Steve Turner), Miami Beach</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Bio;
