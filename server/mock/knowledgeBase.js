/**
 * Mock Knowledge Base
 * Provides rich, realistic study notes, transcripts, OCR visual frames,
 * and flashcards for various academic topics.
 * 
 * Used by aiService.js to generate context-relevant notes based on
 * the video's title and keywords.
 */

export const TOPIC_TEMPLATES = {
  computer_science: {
    title: "Algorithms & Data Structures: Deep Dive into Sorting & Asymptotic Analysis",
    authorName: "MIT OpenCourseWare",
    summary: "Comprehensive breakdown of sorting algorithms, divide-and-conquer paradigms, asymptotic complexity (Big-O, Big-Omega, Big-Theta), and recursion tree analysis. Covers Merge Sort, Quick Sort, and memory cache locality.",
    keyConcepts: [
      { term: "Divide and Conquer", definition: "An algorithmic paradigm that breaks a problem into smaller subproblems, solves them recursively, and combines the results." },
      { term: "Asymptotic Notation", definition: "Mathematical tool to describe the limiting behavior of an algorithm's execution time or memory footprint as input size approaches infinity." },
      { term: "Merge Sort Recurrence", definition: "The recurrence relation $T(n) = 2T(n/2) + \\mathcal{O}(n)$, which resolves to $\\mathcal{O}(n \\log n)$ via the Master Theorem." },
      { term: "Pivot Selection", definition: "The strategy in Quicksort to partition the array; median-of-three or randomized pivots avoid worst-case $\\mathcal{O}(n^2)$ complexity." }
    ],
    markdownContent: `## 📌 Core Lecture Objectives
- Understand why sorting is the foundational primitive in computing.
- Master asymptotic complexity bounds:
  $$\\mathcal{O}(g(n)) = \\{ f(n) : \\exists c > 0, n_0 > 0 \\text{ s.t. } 0 \\le f(n) \\le c \\cdot g(n) \\quad \\forall n \\ge n_0 \\}$$
- Implement and analyze Merge Sort and Quick Sort.

---

## ⏱️ Detailed Lecture Notes with Timestamps

### [00:45] Introduction to Asymptotic Complexity & Big-O
- **Why hardware-independent analysis matters:** Clock speed varies across CPUs, but algorithmic growth rates remain constant.
- **The Three Notations:**
  1. **Big-O ($\\mathcal{O}$):** Upper bound (worst-case guarantee).
  2. **Big-Omega ($\\Omega$):** Lower bound (best-case guarantee).
  3. **Big-Theta ($\\Theta$):** Tight bound (exact asymptotic behavior).

### [04:12] Divide & Conquer: The Merge Sort Paradigm
- **Step 1 (Divide):** Split array of size $n$ into two halves of size $n/2$ until subarrays reach base case ($n \\le 1$).
- **Step 2 (Conquer):** Recursively sort the two halves.
- **Step 3 (Combine):** Merge the sorted halves in linear $\\mathcal{O}(n)$ time with a two-pointer approach.

\`\`\`python
def merge_sort(arr: list[int]) -> list[int]:
    """Recursively sorts an array using Divide and Conquer."""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged
\`\`\`

### [08:30] Complexity Derivation via Master Theorem
- For recurrence relations of the form:
  $$T(n) = a \\cdot T\\left(\\frac{n}{b}\\right) + f(n)$$
  For Merge Sort: $a = 2$, $b = 2$, $f(n) = \\mathcal{O}(n)$.
  Since $\\log_b(a) = \\log_2(2) = 1$ and $f(n) = \\Theta(n^1)$, we apply Case 2 of the Master Theorem:
  $$T(n) = \\Theta(n \\log n)$$

### [13:15] Quick Sort & In-Place Partitioning
- **Advantage over Merge Sort:** Does not require extra auxiliary memory ($\\\\mathcal{O}(1)$ auxiliary space vs $\\\\mathcal{O}(n)$ for Merge Sort).
- **Worst-case pitfall:** $\\mathcal{O}(n^2)$ when the pivot is already the minimum or maximum element.
- **Mitigation:** Use randomized pivot selection or the median-of-three heuristic.

---

## 💡 Key Takeaways & Exam Tips
1. Always state both **time** and **space** complexity during technical interviews.
2. Stability matters: Merge Sort is **stable** (preserves order of duplicates), while standard Quick Sort is **unstable**.
3. Modern standard library sorts (e.g., Python's Timsort) combine Merge Sort with Insertion Sort for small arrays.`,
    flashcards: [
      { question: "What is the worst-case time complexity of Merge Sort?", answer: "O(n log n). Unlike Quick Sort, Merge Sort guarantees O(n log n) even in the worst case.", category: "Complexity" },
      { question: "Why does standard Merge Sort require O(n) auxiliary space?", answer: "Because it needs a temporary array buffer to hold elements while comparing and merging the two halves.", category: "Memory" },
      { question: "How does randomized pivot selection fix Quick Sort's worst case?", answer: "It prevents sorted or reverse-sorted inputs from consistently causing unbalanced partitions of size 1 and n-1.", category: "Algorithms" },
      { question: "What does Big-Theta (Θ) represent in algorithm analysis?", answer: "A tight bound: the function is bounded both above and below by constants multiplied by g(n).", category: "Math" }
    ],
    transcriptSample: [
      { timestamp: "00:45", seconds: 45, speaker: "Prof. John", text: "Today we are analyzing asymptotic notation and why clock cycles alone are not sufficient to evaluate algorithms." },
      { timestamp: "04:12", seconds: 252, speaker: "Prof. John", text: "Look at Merge Sort: we break the problem in half, solve recursively, and merge in linear time." },
      { timestamp: "08:30", seconds: 510, speaker: "Prof. John", text: "Writing out the recurrence: T of n equals 2 T of n over 2 plus O of n. By the Master Theorem, this gives Theta of n log n." },
      { timestamp: "13:15", seconds: 795, speaker: "Prof. John", text: "Quick Sort on the other hand works in-place. If we pick good pivots, the average performance is exceptional." }
    ],
    visionOcrSample: [
      { timestamp: "02:10", frameUrl: "frame_0210.jpg", detectedType: "Diagram", text: "Asymptotic graphs: O(g(n)) upper curve, Omega(g(n)) lower curve, f(n) trapped within Theta." },
      { timestamp: "06:45", frameUrl: "frame_0645.jpg", detectedType: "Blackboard Code", text: "def merge_sort(arr): recurrence tree drawing showing log2(n) levels with n work per level." },
      { timestamp: "10:15", frameUrl: "frame_1015.jpg", detectedType: "Formula", text: "Master Theorem: T(n) = a*T(n/b) + O(n^d), log_b(a) vs d comparison." }
    ]
  },

  machine_learning: {
    title: "Deep Learning & Neural Networks: Backpropagation & Optimization",
    authorName: "Stanford Online",
    summary: "Rigorous exploration of artificial neural networks, activation functions, loss surfaces, computational graphs, and the mathematical derivation of backpropagation using the multivariate chain rule.",
    keyConcepts: [
      { term: "Forward Propagation", definition: "Computing layer-by-layer activations $a^{(l)} = \\sigma(W^{(l)} a^{(l-1)} + b^{(l)})$ from input to output." },
      { term: "Loss Function", definition: "A scalar metric measuring discrepancy between predictions and ground truth, such as Cross-Entropy or Mean Squared Error." },
      { term: "Backpropagation", definition: "Efficient calculation of gradients $\\frac{\\partial \\mathcal{L}}{\\partial W}$ through reverse-mode automatic differentiation using the chain rule." },
      { term: "Gradient Descent with Momentum", definition: "An optimization technique that accelerates convergence by dampening oscillations through an exponentially decaying moving average of past gradients." }
    ],
    markdownContent: `## 📌 Core Lecture Objectives
- Understand computational graphs and reverse-mode automatic differentiation.
- Derive analytical gradients for a multi-layer perceptron (MLP).
- Compare activation functions (ReLU, GELU, Sigmoid) and vanishing gradient phenomena.

---

## ⏱️ Detailed Lecture Notes with Timestamps

### [01:20] The Perceptron & Modern Layer Architectures
- Each neuron computes an affine linear transformation followed by a non-linear activation:
  $$z = \\mathbf{W}^T \\mathbf{x} + b, \\quad a = \\sigma(z)$$
- **Why non-linearity is mandatory:** Stacking linear layers without activation collapses into a single matrix multiplication:
  $$\\mathbf{W}_2 (\\mathbf{W}_1 \\mathbf{x}) = (\\mathbf{W}_2 \\mathbf{W}_1) \\mathbf{x} = \\mathbf{W}_{eff} \\mathbf{x}$$

### [05:40] Cross-Entropy Loss & Softmax
- For multi-class classification with $K$ classes:
  $$P(y = k \\mid \\mathbf{x}) = \\frac{e^{z_k}}{\\sum_{j=1}^K e^{z_j}}$$
- The categorical cross-entropy loss:
  $$\\mathcal{L}_{CE} = - \\sum_{k=1}^K y_k \\log(\\hat{y}_k)$$

\`\`\`python
import torch
import torch.nn as nn

class TwoLayerMLP(nn.Module):
    def __init__(self, in_features: int, hidden_dim: int, num_classes: int):
        super().__init__()
        self.fc1 = nn.Linear(in_features, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.relu(self.fc1(x))
        logits = self.fc2(h)
        return logits
\`\`\`

### [10:55] Mathematical Derivation of Backpropagation
- Applying the multivariate chain rule across the computational graph:
  $$\\frac{\\partial \\mathcal{L}}{\\partial W_{ij}^{(l)}} = \\frac{\\partial \\mathcal{L}}{\\partial z_i^{(l)}} \\cdot \\frac{\\partial z_i^{(l)}}{\\partial W_{ij}^{(l)}} = \\delta_i^{(l)} \\cdot a_j^{(l-1)}$$
- The error term $\\delta^{(l)}$ is propagated backward:
  $$\\delta^{(l)} = \\left( (W^{(l+1)})^T \\delta^{(l+1)} \\right) \\odot \\sigma'(z^{(l)})$$
- Notice the Hadamard (element-wise) product $\\odot$ with the derivative of the activation function.

### [16:30] Modern Optimizers: Adam & AdamW
- **Adam (Adaptive Moment Estimation):**
  Combines momentum (first moment $m_t$) and RMSprop (second raw moment $v_t$):
  $$m_t = \\beta_1 m_{t-1} + (1 - \\beta_1) g_t, \\quad v_t = \\beta_2 v_{t-1} + (1 - \\beta_2) g_t^2$$
  $$\\theta_{t+1} = \\theta_t - \\frac{\\alpha}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t$$

---

## 💡 Practical Study Tips
- When experiencing exploding gradients, check gradient clipping (\`torch.nn.utils.clip_grad_norm_\`).
- For deep networks (>10 layers), always use residual connections ($x + F(x)$) or LayerNorm to preserve gradient flow.`,
    flashcards: [
      { question: "Why do linear layers without non-linear activations fail to learn complex functions?", answer: "Any composition of linear transformations is mathematically equivalent to a single linear transformation.", category: "Architecture" },
      { question: "What is the primary cause of vanishing gradients with Sigmoid activations?", answer: "The maximum derivative of Sigmoid is 0.25; multiplying values < 0.25 across multiple layers causes gradients to decay exponentially.", category: "Optimization" },
      { question: "How does Adam optimizer adapt learning rates for different parameters?", answer: "It scales the step size inversely by the square root of the running variance of past gradients for each parameter.", category: "Optimization" },
      { question: "What is the difference between Adam and AdamW?", answer: "AdamW decouples L2 weight decay from the gradient update step, preventing undesirable interaction with momentum.", category: "Optimization" }
    ],
    transcriptSample: [
      { timestamp: "01:20", seconds: 80, speaker: "Dr. Andrew", text: "If we don't include a non-linear activation like ReLU or Sigmoid, our entire multi-layer network is just one big matrix multiplication." },
      { timestamp: "05:40", seconds: 340, speaker: "Dr. Andrew", text: "Cross-entropy loss measures how closely our predicted probability distribution matches the true one-hot vector." },
      { timestamp: "10:55", seconds: 655, speaker: "Dr. Andrew", text: "Backpropagation is simply the multivariate chain rule applied recursively from output to input." },
      { timestamp: "16:30", seconds: 990, speaker: "Dr. Andrew", text: "Adam tracks both first and second moments to give individual learning rates to each parameter." }
    ],
    visionOcrSample: [
      { timestamp: "03:15", frameUrl: "frame_0315.jpg", detectedType: "Diagram", text: "Forward computation graph: x -> [W1] -> z1 -> [ReLU] -> a1 -> [W2] -> z2 -> Loss." },
      { timestamp: "11:40", frameUrl: "frame_1140.jpg", detectedType: "Whiteboard Derivation", text: "dL/dW = delta * a^(l-1) with red arrows illustrating backward gradient flow." },
      { timestamp: "17:05", frameUrl: "frame_1705.jpg", detectedType: "Slide Equations", text: "Adam update equations: m_t = beta1*m + (1-beta1)*g, v_t = beta2*v + (1-beta2)*g^2." }
    ]
  },

  physics_math: {
    title: "Multivariable Calculus & Classical Electromagnetism: Maxwell's Equations",
    authorName: "MIT Physics & Math",
    summary: "Unified study of vector calculus operators (Gradient, Divergence, Curl) and their fundamental role in Maxwell's Equations of Electrodynamics. Includes Stokes' Theorem and the Divergence Theorem.",
    keyConcepts: [
      { term: "Divergence ($\\nabla \\cdot \\mathbf{F}$)", definition: "Scalar measure of outward flux density radiating from an infinitesimal volume around a point." },
      { term: "Curl ($\\nabla \\times \\mathbf{F}$)", definition: "Vector measure of circulation density and rotational tendency around an infinitesimal loop." },
      { term: "Gauss's Law", definition: "The electric flux through any closed surface is proportional to the enclosed charge: $\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{enc}}{\\varepsilon_0}$." },
      { term: "Faraday's Law of Induction", definition: "A time-varying magnetic field induces an electromotive force (curly electric field): $\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$." }
    ],
    markdownContent: `## 📌 Core Lecture Objectives
- Master the physical intuition of vector differential operators ($\\nabla, \\nabla \\cdot, \\nabla \\times$).
- Connect the integral and differential formulations of Maxwell's Equations.
- Understand the origin of electromagnetic waves traveling at speed $c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}$.

---

## ⏱️ Detailed Lecture Notes with Timestamps

### [02:10] The Del Operator ($\\nabla$) & Vector Fields
- In Cartesian coordinates $(x, y, z)$:
  $$\\nabla = \\mathbf{\\hat{i}} \\frac{\\partial}{\\partial x} + \\mathbf{\\hat{j}} \\frac{\\partial}{\\partial y} + \\mathbf{\\hat{k}} \\frac{\\partial}{\\partial z}$$
- **Gradient:** Maps scalar field $\\phi$ to vector field pointing in direction of steepest ascent:
  $$\\nabla \\phi = \\left( \\frac{\\partial \\phi}{\\partial x}, \\frac{\\partial \\phi}{\\partial y}, \\frac{\\partial \\phi}{\\partial z} \\right)$$

### [06:45] Divergence & Gauss's Theorem
- The Divergence Theorem converts a surface integral to a volume integral:
  $$\\oint_{\\partial V} \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_V (\\nabla \\cdot \\mathbf{F}) \\, dV$$
- **Differential Gauss's Law for Electrostatics:**
  $$\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}$$
  Where $\\rho$ is electric charge density and $\\varepsilon_0$ is the permittivity of free space.

### [12:00] Curl & Faraday's Law
- Stokes' Theorem links circulation around boundary contour $C$ to surface flux of curl:
  $$\\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$$
- **Faraday's Law:**
  $$\\nabla \\times \\mathbf{E} = - \\frac{\\partial \\mathbf{B}}{\\partial t}$$
  A changing magnetic field creates a non-conservative electric field.

### [18:25] The Four Maxwell Equations in Vacuum
1. **Gauss's Law:** $\\nabla \\cdot \\mathbf{E} = 0$
2. **Gauss's Law for Magnetism:** $\\nabla \\cdot \\mathbf{B} = 0$ (No magnetic monopoles)
3. **Faraday's Law:** $\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$
4. **Ampère-Maxwell Law:** $\\nabla \\times \\mathbf{B} = \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}$

- Taking the curl of Faraday's Law produces the electromagnetic wave equation:
  $$\\nabla^2 \\mathbf{E} = \\mu_0 \\varepsilon_0 \\frac{\\partial^2 \\mathbf{E}}{\\partial t^2} \\implies c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}} \\approx 3 \\times 10^8 \\text{ m/s}$$`,
    flashcards: [
      { question: "What does Divergence tell us physically about a vector field?", answer: "It measures whether a point acts as a source (positive divergence) or a sink (negative divergence) of field lines.", category: "Calculus" },
      { question: "Why is the divergence of the magnetic field B always zero (∇ · B = 0)?", answer: "Because experimental physics has never observed isolated magnetic monopoles; magnetic field lines always form closed loops.", category: "Electromagnetism" },
      { question: "What correction did Maxwell add to Ampère's Law?", answer: "The displacement current term μ₀ ε₀ (∂E/∂t), which accounts for magnetic fields created by changing electric fields.", category: "Physics" },
      { question: "What mathematical theorem converts a line integral around a closed loop to a surface integral of curl?", answer: "Stokes' Theorem.", category: "Math" }
    ],
    transcriptSample: [
      { timestamp: "02:10", seconds: 130, speaker: "Prof. Walter", text: "The gradient points in the direction where the temperature or potential changes most rapidly." },
      { timestamp: "06:45", seconds: 405, speaker: "Prof. Walter", text: "If we imagine an expanding fluid, divergence tells us how much volume is being created or swallowed per second." },
      { timestamp: "12:00", seconds: 720, speaker: "Prof. Walter", text: "Moving a magnet through a coil generates an electric current because curl of E equals minus dB by dt." },
      { timestamp: "18:25", seconds: 1105, speaker: "Prof. Walter", text: "When Maxwell added his displacement term, wave equations fell right out, showing light itself is an electromagnetic wave!" }
    ],
    visionOcrSample: [
      { timestamp: "03:40", frameUrl: "frame_0340.jpg", detectedType: "Diagram", text: "Contour map showing gradient vectors perpendicular to equipotential lines." },
      { timestamp: "08:15", frameUrl: "frame_0815.jpg", detectedType: "Formula", text: "Integral Gauss Law: closed surface integral E · dA = Q_enclosed / epsilon_0." },
      { timestamp: "19:10", frameUrl: "frame_1910.jpg", detectedType: "Blackboard", text: "Derivation of Wave Equation: curl(curl(E)) = grad(div(E)) - laplacian(E)." }
    ]
  },

  general_lecture: {
    title: "Mastering Active Recall, Spaced Repetition & Deep Learning Methodologies",
    authorName: "Learning Science Institute",
    summary: "Evidence-based learning strategies derived from cognitive psychology and neuroscience. Covers the Ebbinghaus forgetting curve, Feynman Technique, optimal Pomodoro cycles, and multimodal encoding.",
    keyConcepts: [
      { term: "Active Recall", definition: "Testing memory retrieval during study instead of passively re-reading or highlighting material." },
      { term: "Spaced Repetition", definition: "Reviewing information at increasing intervals to counteract the biological decay of synaptic strength." },
      { term: "Feynman Technique", definition: "Explaining a concept in plain language to an imagined beginner to immediately expose gaps in understanding." },
      { term: "Dual Coding Theory", definition: "Combining verbal explanations with visual representations (diagrams, mindmaps) to double the pathways for retrieval." }
    ],
    markdownContent: `## 📌 Core Lecture Objectives
- Replace passive re-reading with evidence-based cognitive strategies.
- Design an automated spaced repetition schedule using the Ebbinghaus retention equation:
  $$R = e^{-\\frac{t}{S}}$$
- Implement synthesis workflows from video lectures to long-term memory.

---

## ⏱️ Detailed Lecture Notes with Timestamps

### [01:15] The Illusion of Competence
- **Why highlighting fails:** Re-reading gives a feeling of fluency that masquerades as genuine mastery.
- **Cognitive Effort = Retention:** The harder your brain works to retrieve an item, the stronger the neural trace becomes.

### [05:00] The Mathematical Model of Memory Decay
- Hermann Ebbinghaus's exponential forgetting curve:
  $$R(t) = e^{-t / S}$$
  Where $R$ is memory retention, $t$ is time elapsed, and $S$ is relative strength of memory.
- **The Spaced Repetition Intervention:**
  Each active recall test flattens the decay curve, requiring exponentially longer gaps between reviews.

### [09:30] Step-by-Step Feynman Technique
1. **Choose a target concept** (e.g., *Dynamic Programming*, *Mitochondrial ATP synthesis*).
2. **Explain it to a 12-year-old:** Use analogies and simple vocabulary.
3. **Identify the friction point:** When you resort to jargon, stop — that is your exact blind spot.
4. **Re-study the primary source:** Review the specific concept and refine your explanation.

### [14:20] How TubeNotes AI Fits the Workflow
- Step 1: Watch lecture once without pausing constantly to take transcript notes.
- Step 2: Review generated structured notes to establish mental schema.
- Step 3: Use the generated flashcards for immediate active retrieval practice.`,
    flashcards: [
      { question: "Why is active recall far more effective than re-reading?", answer: "Retrieval practice triggers neuroplastic strengthening of synaptic pathways, whereas passive reading only tests recognition.", category: "Cognitive Science" },
      { question: "What does parameter 'S' represent in Ebbinghaus's equation R = e^(-t/S)?", answer: "Memory strength or stability: the higher the value, the slower memory decays over time.", category: "Psychology" },
      { question: "What is the core rule of the Feynman Technique?", answer: "If you cannot explain a concept simply without jargon, you do not truly understand it yet.", category: "Study Methods" }
    ],
    transcriptSample: [
      { timestamp: "01:15", seconds: 75, speaker: "Dr. Elena", text: "Highlighting creates what cognitive scientists call an illusion of competence. You recognize the words, but you cannot retrieve them." },
      { timestamp: "05:00", seconds: 300, speaker: "Dr. Elena", text: "Ebbinghaus showed that within 48 hours, over 70 percent of passive lecture content evaporates without review." },
      { timestamp: "09:30", seconds: 570, speaker: "Dr. Elena", text: "The Feynman Technique forces you to strip away buzzwords and explain concepts in everyday language." }
    ],
    visionOcrSample: [
      { timestamp: "02:30", frameUrl: "frame_0230.jpg", detectedType: "Diagram", text: "Brain scan illustration highlighting prefrontal cortex activation during active retrieval vs passive scanning." },
      { timestamp: "06:10", frameUrl: "frame_0610.jpg", detectedType: "Graph", text: "Forgetting curve: comparison of no review (steep drop) vs 3 spaced repetitions (plateau at 90%)." }
    ]
  }
};

/**
 * Selects an appropriate mock template based on video title, channel, or keywords
 * @param {object} videoInfo 
 * @returns {object} Selected template
 */
export function getTemplateForVideo(videoInfo = {}) {
  const text = `${videoInfo.title || ''} ${videoInfo.authorName || ''}`.toLowerCase();

  if (text.includes('deep learning') || text.includes('neural') || text.includes('machine learning') || text.includes('ai') || text.includes('gpt') || text.includes('llm') || text.includes('backprop')) {
    return TOPIC_TEMPLATES.machine_learning;
  }
  if (text.includes('algorithm') || text.includes('data structure') || text.includes('sort') || text.includes('cs') || text.includes('python') || text.includes('code') || text.includes('react') || text.includes('web') || text.includes('computer')) {
    return TOPIC_TEMPLATES.computer_science;
  }
  if (text.includes('calculus') || text.includes('physics') || text.includes('math') || text.includes('maxwell') || text.includes('equation') || text.includes('quantum') || text.includes('derivative') || text.includes('integral')) {
    return TOPIC_TEMPLATES.physics_math;
  }
  
  return TOPIC_TEMPLATES.general_lecture;
}

